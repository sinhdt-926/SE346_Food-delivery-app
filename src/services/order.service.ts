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
    created_at: new Date(order.created_at),
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
  avatarUrl: string;
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
                foods(name)
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
      quantity: item.quantity,
      price: item.price,
      subtotal: Number(item.subtotal),
      note: item.note,
    }));

    console.log("PAYMENTS:", order.payments);

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: order.id,
      created_at: new Date(order.created_at),
      status: order.status,
      address: order.delivery_address,
      customer: {
        id: user?.id ?? "",
        fullname: user?.fullname ?? "",
        phone_number: user?.phone_number ?? "",
        //avatarUrl: user?.avatarUrl ?? "",
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
