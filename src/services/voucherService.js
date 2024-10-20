const { or } = require("sequelize");
const db = require("../models/index");

const applyVoucher = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkOrder = await db.Order.findOne({
                where: {
                    id: data.order_id,
                    status: 'pending'
                },
            });

            if (!checkOrder) {
                resolve({
                    errCode: 1,
                    errMessage: 'Đơn hàng không tồn tại hoặc không ở trạng thái pending'
                });
                return;
            }

            const checkVoucher = await db.Voucher.findOne({
                where: {
                    code: data.voucher,
                    is_active: 1,
                    expiry_date: {
                        [db.Sequelize.Op.gt]: new Date()
                    }
                },
            });

            if (!checkVoucher) {
                resolve({
                    errCode: 1,
                    errMessage: 'Mã giảm giá không hợp lệ'
                });
                return;
            }

            if (checkVoucher.min_order_value > checkOrder.total) {
                resolve({
                    errCode: 1,
                    errMessage: 'Giá trị đơn hàng không đủ để sử dụng mã giảm giá'
                });
                return;
            }

            let newTotal = checkOrder.total;

            if (checkVoucher.type === 'percent') {
                newTotal = Math.max(0, checkOrder.total - checkVoucher.discount_value);
            } else if (checkVoucher.type === 'fixed') {
                newTotal = Math.max(0, checkOrder.total - (checkOrder.total * checkVoucher.discount_value / 100));
            }


            resolve({
                errCode: 0,
                errMessage: 'Sử dụng mã giảm giá thành công',
                total: newTotal,
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    applyVoucher
}