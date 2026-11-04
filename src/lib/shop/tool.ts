import type { ToolInfo } from "@/components/account/AppBar";

// Where the sales & stock book lives: the public intro page and the signed-in app.

export const SHOP_PATH = "/cong-cu/quan-ly-ban-hang";
export const SHOP_APP = `${SHOP_PATH}/so-hang`;

export const SHOP_TOOL: ToolInfo = {
  href: SHOP_PATH,
  name: "Quản lý bán hàng",
  nav: [
    [SHOP_APP, "Sổ hàng của tôi"],
    [SHOP_PATH, "Giới thiệu"],
  ],
};
