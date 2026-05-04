import { supabase } from "./supabase";

// Khách hàng lấy danh sách đơn
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
            ),
            payments(
                amount,
                status
            )
        `)
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
        total: (order.payments && order.payments.length > 0) 
            ? Number(order.payments[0].amount) 
            : 0,
    }));
};

type User = {
    fullname: string;
    phone_number: string;
};

// Admin/Owner lấy toàn bộ danh sách đơn
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
            ),
            payments(
                amount,
                status
            )
        `)
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
        
        // Lấy tổng tiền từ bảng payments thay vì tính tổng bằng vòng lặp reduce
        const total = (order.payments && order.payments.length > 0) 
            ? Number(order.payments[0].amount) 
            : 0;

        return {
            id: order.id,
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