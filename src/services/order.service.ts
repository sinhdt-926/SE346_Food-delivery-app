import { supabase } from "./supabase";
import { parseDeliveryAddress } from "../utils/formatters";

// Khách hàng lấy danh sách đơn
export const getMyOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
            id,
            created_at,
            updated_at,
            status,
            delivery_address,
            note,
            order_details(
                quantity,
                price,
                subtotal,
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
    updated_at: order.updated_at || order.created_at,
    status: order.status,
    address: parseDeliveryAddress(order.delivery_address).address,
    note: order.note,
    items: (order.order_details ?? []).map((item: any) => ({
      name: item.foods?.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: Number(item.subtotal),
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
  image_url?: string;
  avatarUrl?: string;
};

// Admin/Owner lấy toàn bộ danh sách đơn
export const getOwnerOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
            id,
            created_at,
            updated_at,
            status,
            delivery_address,
            note,
            users(id, fullname, phone_number, image_url),
            order_details(
                quantity,
                price,
                subtotal,
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
    }));
    // Lấy tổng tiền từ bảng payments thay vì tính tổng bằng vòng lặp reduce
    const total =
      order.payments && order.payments.length > 0
        ? Number(order.payments[0].amount)
        : 0;

    return {
      id: order.id,
      created_at: order.created_at,
      updated_at: order.updated_at || order.created_at,
      status: order.status,
      address: parseDeliveryAddress(order.delivery_address).address,
      note: order.note,
      customer: {
        id: user?.id ?? "",
        fullname: user?.fullname ?? "",
        phone_number: user?.phone_number ?? "",
        avatarUrl: user?.image_url ?? undefined,
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
  const updateData: any = { status };
  if (status === "delivering") {
    updateData.delivery_started_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
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

export const getOrderAddress = async (orderId: number) => {
  const { data, error } = await supabase
    .from("orders")
    .select("status, delivery_address, delivery_started_at")
    .eq("id", orderId)
    .single();

  if (error) throw error;
  if (data) {
    const parsed = parseDeliveryAddress(data.delivery_address);
    data.delivery_address = parsed.address;
    (data as any).latitude = parsed.latitude;
    (data as any).longitude = parsed.longitude;
  }
  return data;
};

export const subscribeToOrderUpdates = (
  orderId: number,
  onUpdate: (payload: any) => void,
) => {
  const channel = supabase
    .channel(`public:orders:${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToUserOrders = (userId: string, onUpdate: (payload?: any) => void) => {
  // Thêm random suffix để tránh lỗi trùng channel khi component khác cùng lắng nghe
  const channel = supabase
    .channel(`public:orders:user:${userId}-${Math.random()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Owner: Lắng nghe tất cả đơn hàng mới trên toàn hệ thống
export const subscribeToNewGlobalOrders = (onInsert: (payload: any) => void) => {
  const channel = supabase
    .channel(`public:new_orders-${Math.random()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => {
        onInsert(payload);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
