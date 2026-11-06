"use client";

import { Icon, type IconName } from "./icons";
import { Panel, type Sheet, useShop } from "./ui";

// The "+" button's menu: everything you can add, as big tiles. Selling (full width) and buying come first.

const ITEMS: [Sheet, IconName, string, string, string?][] = [
  [{ t: "voucher", kind: "out" }, "cart", "Bán hàng", "Ghi đơn, trừ kho, tính lãi", "out"],
  [{ t: "voucher", kind: "order" }, "receipt", "Đặt hàng", "Lên đơn gửi nguồn hàng", "in"],
  [{ t: "voucher", kind: "in" }, "box", "Nhập hàng", "Hàng về, cộng kho", "in"],
  [{ t: "product" }, "flower", "Mẫu mới", "Thêm mẫu hoa vào danh mục"],
  [{ t: "supplier" }, "truck", "Nguồn hàng", "Lưu chỗ lấy hàng"],
  [{ t: "note" }, "note", "Ghi chú", "Ý tưởng, việc cần làm"],
  [{ t: "voucher", kind: "adjust" }, "scale", "Điều chỉnh kho", "Hàng hỏng, kiểm kho"],
];

export default function QuickCreate({ onClose }: { onClose: () => void }) {
  const { open } = useShop();
  return (
    <Panel title="Tạo mới" onClose={onClose}>
      <div className="sh-quick">
        {ITEMS.map(([sheet, icon, title, text, tone]) => (
          <button
            key={title}
            type="button"
            className={tone ?? ""}
            onClick={() => {
              onClose();
              open(sheet);
            }}
          >
            <Icon name={icon} size={26} />
            <b>{title}</b>
            <small>{text}</small>
          </button>
        ))}
      </div>
    </Panel>
  );
}
