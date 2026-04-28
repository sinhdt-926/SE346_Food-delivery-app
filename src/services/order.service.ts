import { supabase } from "./supabase";

//Customer lấy đơn
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

    return data.map((order) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        address: order.delivery_address,

        items: order.order_details.map((item: any) => ({
            name: item.foods?.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            note: item.note,
        })),

        total: order.order_details.reduce(
            (sum: number, item: any) => sum + item.subtotal,
            0
        ),
    }));
};

type User = {
    fullname: string;
    phone_number: string;
};
//Owner lấy đơn
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
        const user = order.users?.[0];

        const items = (order.order_details ?? []).map((item: any) => ({
            name: item.foods?.name ?? "",
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            note: item.note,
        }));

        const total = (order.order_details ?? []).reduce(
            (sum: number, item: any) => sum + item.subtotal,
            0
        );

        return {
            id: order.id,
            created_at: order.created_at,
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