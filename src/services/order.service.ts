import { supabase } from "./supabase";

// Customer lấy đơn
export const getMyOrders = async () => {
    const { data, error } = await supabase
        .from("orders")
        .select(`
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
      )
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((order) => ({
        id: order.id,
        // FIX 1: convert timestamp
        created_at: new Date(order.created_at),

        status: order.status,
        address: order.delivery_address,

        items: (order.order_details ?? []).map((item: any) => ({
            name: item.foods?.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: Number(item.subtotal), // FIX 2
            note: item.note,
        })),

        total: (order.order_details ?? []).reduce(
            (sum: number, item: any) => sum + Number(item.subtotal), // FIX 2
            0
        ),
    }));
};

type User = {
    fullname: string;
    phone_number: string;
};

// Owner lấy đơn
export const getOwnerOrders = async () => {
    const { data, error } = await supabase
        .from("orders")
        .select(`
      id,
      created_at,
      status,
      delivery_address,
      users(fullname, phone_number),
      order_details(
        quantity,
        price,
        subtotal,
        note,
        foods(name)
      )
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((order) => {
        // FIX 3
         const user = order.users as unknown as User;

        const items = (order.order_details ?? []).map((item: any) => ({
            name: item.foods?.name ?? "",
            quantity: item.quantity,
            price: item.price,
            subtotal: Number(item.subtotal), // FIX 2
            note: item.note,
        }));

        const total = (order.order_details ?? []).reduce(
            (sum: number, item: any) => sum + Number(item.subtotal), // FIX 2
            0
        );

        return {
            id: order.id,
            // FIX 1
            created_at: new Date(order.created_at),

            status: order.status,
            address: order.delivery_address,

            customer: {
                name: user?.fullname ?? "",
                phone: user?.phone_number ?? "",
            },

            items,
            total,
        };
    });
};