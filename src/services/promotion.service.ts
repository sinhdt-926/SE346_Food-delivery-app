import { supabase } from './supabase';

//Lấy mã
export const getValidPromotions = async() => {
    const now = new Date().toISOString();
    const {data, error} = await supabase
        .from('promotions')
        .select('*')
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now);
    if(error)
    {
        throw error;
    }
    return data;
}

//Tạo mã
export const createPromotion = async(data: {
    name: string;
    discount_type: string;
    discount_value: number;
    start_date: string;
    end_date: string;
}) => {
    const {data: result, error} = await supabase
        .from("promotions")
        .insert([
            {
                name: data.name,
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                start_date: data.start_date,
                end_date: data.end_date,
                is_active: true,
            },
        ])
        .select();
    if(error){
        throw error;
    }
    return result;
}

//Áp dụng mã
export const applyPromotion = (price: number, promo: any) => {
    if(!promo){
        return price;
    }
    if(promo.discount_type === "percent")
    {
        return price - (price * promo.discount_value) / 100;
    }

    if(promo.discount_type === "fixed"){
        return price - promo.discount_value;
    }
    return price;
}