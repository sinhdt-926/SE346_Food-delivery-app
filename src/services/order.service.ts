import { supabase } from "./supabase";

// Khách hàng lấy danh sách đơn
export const getMyOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
            id,
            created_at,
            status,
            delivery_address,
            order_details(
                quantity,
                price,
                subtotal,
                note,
                foods(name)
            ),
            payments(
                amount,
                status
            )
        `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((order) => ({
    id: order.id,
    created_at: order.created_at,
    status: order.status,
    address: order.delivery_address,
    items: (order.order_details ?? []).map((item: any) => ({
      name: item.foods?.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: Number(item.subtotal),
      note: item.note,
    })),
    // Lấy tổng tiền thực tế (đã giảm) từ bản ghi payments đầu tiên thuộc về order này
    total:
      order.payments && order.payments.length > 0
        ? Number(order.payments[0].amount)
        : 0,
  }));
};

type User = {
  id: string;
  fullname: string;
  phone_number: string;
};

// Admin/Owner lấy toàn bộ danh sách đơn
export const getOwnerOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
            id,
            created_at,
            status,
            delivery_address,
            users(id, fullname, phone_number),
            order_details(
                quantity,
                price,
                subtotal,
                note,
                foods(name, image_url)
            ),
            payments(
                id,
                amount,
                status,
                type
            )
        `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((order) => {
    const user = order.users as unknown as User;
    const items = (order.order_details ?? []).map((item: any) => ({
      name: item.foods?.name ?? "",
      image_url: item.foods?.image_url ?? "",
      quantity: item.quantity,
      price: item.price,
      subtotal: Number(item.subtotal),
      note: item.note,
    }));
    // Lấy tổng tiền từ bảng payments thay vì tính tổng bằng vòng lặp reduce
    const total =
      order.payments && order.payments.length > 0
        ? Number(order.payments[0].amount)
        : 0;

    return {
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      address: order.delivery_address,
      customer: {
        id: user?.id ?? "",
        fullname: user?.fullname ?? "",
        phone_number: user?.phone_number ?? "",
      },
      items,
      payment: {
        id: order.payments?.[0]?.id ?? 0,
        type: order.payments?.[0]?.type ?? "cash",
        amount: total,
        status: order.payments?.[0]?.status ?? "unpaid",
      },
    };
  });
};
export const updateOrderStatus = async (id: number, status: string) => {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};
//đếm số đơn đang thực hiện
export const getRunningOrdersCount = async () => {
  const { count, error } = await supabase
    .from("orders")
    .select("*", {
      count: "exact",
      head: true,
    })
    .in("status", ["pending", "preparing", "delivering"]);
  if (error) throw error;
  return count ?? 0;
};
//đếm số đơn hàng đang chờ phản hồi
export const getRequestsCount = async () => {
  const { count, error } = await supabase
    .from("orders")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
};

export const getPaymentStatus = async (orderId: number) => {
  const { data, error } = await supabase
    .from("payments")
    .select("status, amount, type, paid_at, transaction_no")
    .eq("order_id", orderId)
    .single();

  if (error) throw error;
  return data;
};
