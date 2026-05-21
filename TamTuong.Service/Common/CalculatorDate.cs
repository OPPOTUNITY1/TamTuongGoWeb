using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common
{
    public class CalculatorDate
    {
        public static int TinhNgayThucTe(List<DateTime> listNgayLe, DateTime ngayBatDau, int soNgayCanTinh, bool tinhNgayLe)
        {
            // Cấu hình skip thứ 7, CN (đưa ra biến để sau này dễ sửa logic)
            bool skipThu7 = tinhNgayLe;
            bool skipChuNhat = tinhNgayLe;

            // Chuyển list ngày lễ sang HashSet để tra cứu cho nhanh (O(1)) và chỉ lấy phần Date
            var hashSetNgayLe = new HashSet<DateTime>(listNgayLe.Select(x => x.Date));

            DateTime currentDate = ngayBatDau;
            int daysCounted = 0;
            int totalDate = 0;
            // Vòng lặp đếm đủ số ngày làm việc
            while (daysCounted < soNgayCanTinh)
            {
                totalDate++;
                // 1. Tăng lên 1 ngày để kiểm tra ngày tiếp theo
                currentDate = currentDate.AddDays(-1);

                // 2. Kiểm tra Thứ 7, CN
                // Nếu cấu hình bỏ qua cuối tuần thì continue (không tăng daysCounted)
                if (IsWeekend(currentDate, skipThu7, skipChuNhat))
                {
                    continue;
                }

                // 3. Kiểm tra Ngày lễ
                // Chỉ kiểm tra nếu cấu hình IsNgayLe = true
                if (tinhNgayLe)
                {
                    // Nếu ngày hiện tại nằm trong danh sách lễ => Bỏ qua
                    if (hashSetNgayLe.Contains(currentDate.Date))
                    {
                        continue;
                    }
                }

                // Nếu không dính các case trên => Là ngày làm việc hợp lệ
                daysCounted++;
            }

            return totalDate;
        }

        /// <summary>
        /// Hàm kiểm tra logic cuối tuần (tách riêng để dễ maintain)
        /// </summary>
        private static bool IsWeekend(DateTime date, bool skipT7, bool skipCN)
        {
            if (skipT7 && date.DayOfWeek == DayOfWeek.Saturday) return true;
            if (skipCN && date.DayOfWeek == DayOfWeek.Sunday) return true;
            return false;
        }
    }
}
