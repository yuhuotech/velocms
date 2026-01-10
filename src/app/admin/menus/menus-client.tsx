"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2, Save, ExternalLink } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

interface MenusClientProps {
  dict: Dictionary;
  initialMenus: any[];
}

export default function MenusClient({ dict, initialMenus }: MenusClientProps) {
  const [menus, setMenus] = useState(initialMenus);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setMenus([
      ...menus,
      {
        id: Date.now(), // Temporary ID
        label: "新菜单",
        url: "/",
        sortOrder: menus.length + 1,
        isActive: true,
        isNew: true,
      },
    ]);
  };

  const handleDelete = async (id: number, isNew?: boolean) => {
    if (confirm("确定要删除这个菜单项吗？")) {
      if (isNew) {
        setMenus(menus.filter((m) => m.id !== id));
        return;
      }

      try {
        const res = await fetch(`/api/admin/menus/${id}`, { method: "DELETE" });
        if (res.ok) {
          setMenus(menus.filter((m) => m.id !== id));
        }
      } catch (err) {
        alert("删除失败");
      }
    }
  };

  const handleChange = (id: number, field: string, value: any) => {
    setMenus(menus.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // For simplicity, we send all items to update order and details
      const itemsToSave = menus.map((m: any, index: number) => ({
        ...m,
        sortOrder: index + 1,
        id: m.isNew ? undefined : m.id, // Send undefined for new items
      }));

      const res = await fetch("/api/admin/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemsToSave),
      });

      if (res.ok) {
        window.location.reload(); // Reload to get fresh IDs and state
      } else {
        alert("保存失败");
      }
    } catch (err) {
      alert("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[index - 1];
    newMenus[index - 1] = temp;
    setMenus(newMenus);
  };

  const moveDown = (index: number) => {
    if (index === menus.length - 1) return;
    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[index + 1];
    newMenus[index + 1] = temp;
    setMenus(newMenus);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">
            {dict.admin.menus || "菜单管理"}
          </h1>
          <p className="text-xs text-muted-foreground">
            管理前台导航菜单及其排序
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            添加菜单项
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "保存中..." : "保存更改"}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 w-10"></th>
              <th className="px-4 py-2 text-left font-medium">显示名称</th>
              <th className="px-4 py-2 text-left font-medium">链接地址</th>
              <th className="px-4 py-2 text-left font-medium">窗口</th>
              <th className="px-4 py-2 text-left font-medium">状态</th>
              <th className="px-4 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {menus.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  暂无菜单项，请添加
                </td>
              </tr>
            ) : (
              menus.map((menu: any, index: number) => (
                <tr key={menu.id} className="hover:bg-accent/30 group">
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveUp(index)}
                        className="hover:text-primary"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        className="hover:text-primary"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={menu.label}
                      onChange={(e) =>
                        handleChange(menu.id, "label", e.target.value)
                      }
                      className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={menu.url}
                      onChange={(e) =>
                        handleChange(menu.id, "url", e.target.value)
                      }
                      className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={menu.target}
                      onChange={(e) =>
                        handleChange(menu.id, "target", e.target.value)
                      }
                      className="bg-transparent focus:outline-none"
                    >
                      <option value="_self">当前窗口</option>
                      <option value="_blank">新窗口</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={menu.isActive}
                      onChange={(e) =>
                        handleChange(menu.id, "isActive", e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(menu.id, menu.isNew)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
