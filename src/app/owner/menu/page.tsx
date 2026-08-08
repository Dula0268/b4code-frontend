/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { menuApi } from "@/api/owner/menu.api";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    LayoutDashboard,
    Building2,
    Tag,
    BookOpen,
    UtensilsCrossed,
    Users,
    MessageSquare,
    Star,
    Settings,
    Plus,
    Trash2,
    Pencil,
    ChevronDown,
    X,
    AlertCircle,
    Check,
} from "lucide-react";

/* ─────────────────────────── types ─────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

/* ─────────────────────────── component ─────────────────────────── */
export default function MenuPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    /* ── properties ── */
    const [properties, setProperties] = useState<AnyRecord[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [propDropOpen, setPropDropOpen] = useState(false);

    /* ── tabs ── */
    const [activeTab, setActiveTab] = useState<"menus" | "categories" | "items">("menus");

    /* ── data ── */
    const [menus, setMenus] = useState<AnyRecord[]>([]);
    const [categories, setCategories] = useState<AnyRecord[]>([]);
    const [items, setItems] = useState<AnyRecord[]>([]);

    /* ── loading ── */
    const [loadingMenus, setLoadingMenus] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    /* ── modals ── */
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemPanel, setShowItemPanel] = useState(false);
    const [editingItem, setEditingItem] = useState<AnyRecord | null>(null);

    /* ── forms ── */
    const [menuForm, setMenuForm] = useState({ name: "", description: "", status: "active" });
    const [categoryForm, setCategoryForm] = useState({ name: "" });
    const [itemForm, setItemForm] = useState<AnyRecord>({
        name: "", description: "", price: "", tag: "", calories: "",
        categoryId: "", menuId: "", isAvailable: true,
    });

    /* ── errors ── */
    const [menuFormError, setMenuFormError] = useState("");
    const [categoryFormError, setCategoryFormError] = useState("");
    const [itemFormError, setItemFormError] = useState("");
    const [savingMenu, setSavingMenu] = useState(false);
    const [savingCategory, setSavingCategory] = useState(false);
    const [savingItem, setSavingItem] = useState(false);

    /* ── nav ── */
    const navItems = [
        { label: "Dashboard",  icon: <LayoutDashboard size={18} />, href: "/owner" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Staff",      icon: <Users size={18} />, href: "/owner/staff" },
        { label: "Reviews",    icon: <Star size={18} />, href: "/owner/reviews" },
        { label: "Messages",   icon: <MessageSquare size={18} />, href: "/owner/message" },
        { label: "Settings",   icon: <Settings size={18} />, href: "/owner/setting/accountSetting" },
    ];

    /* ── fetch properties ── */
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await propertiesApi.listProperties(ownerId, 1, 100);
                const list: AnyRecord[] = data.properties ?? data.content ?? data ?? [];
                setProperties(list);
                if (list.length > 0) setSelectedPropertyId(list[0].id ?? list[0].propertyId);
            } catch (e) {
                console.error("Failed to load properties", e);
            }
        };
        fetch();
    }, [ownerId]);

    /* ── fetch tab data whenever property / tab changes ── */
    useEffect(() => {
        if (!selectedPropertyId) return;
        if (activeTab === "menus") fetchMenus();
        if (activeTab === "categories") fetchCategories();
        if (activeTab === "items") { fetchCategories(); fetchMenus(); fetchItems(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPropertyId, activeTab]);

    const fetchMenus = async () => {
        if (!selectedPropertyId) return;
        setLoadingMenus(true);
        try {
            const data = await menuApi.getMenusByProperty(selectedPropertyId);
            setMenus(Array.isArray(data) ? data : data.menus ?? []);
        } catch (e) { console.error(e); }
        finally { setLoadingMenus(false); }
    };

    const fetchCategories = async () => {
        if (!selectedPropertyId) return;
        setLoadingCategories(true);
        try {
            const data = await menuApi.getCategoriesByProperty(selectedPropertyId);
            setCategories(Array.isArray(data) ? data : data.categories ?? []);
        } catch (e) { console.error(e); }
        finally { setLoadingCategories(false); }
    };

    const fetchItems = async () => {
        if (!selectedPropertyId) return;
        setLoadingItems(true);
        try {
            const data = await menuApi.getItemsByProperty(selectedPropertyId);
            setItems(Array.isArray(data) ? data : data.items ?? []);
        } catch (e) { console.error(e); }
        finally { setLoadingItems(false); }
    };

    /* ── menu CRUD ── */
    const handleCreateMenu = async () => {
        if (!menuForm.name.trim()) { setMenuFormError("Name is required."); return; }
        if (!selectedPropertyId) return;
        setSavingMenu(true);
        try {
            await menuApi.createMenu({ propertyId: selectedPropertyId, name: menuForm.name.trim(), description: menuForm.description, status: menuForm.status });
            setShowMenuModal(false);
            setMenuForm({ name: "", description: "", status: "active" });
            setMenuFormError("");
            fetchMenus();
        } catch (e) { console.error(e); setMenuFormError("Failed to create menu."); }
        finally { setSavingMenu(false); }
    };

    const handleDeleteMenu = async (id: number) => {
        if (!window.confirm("Delete this menu?")) return;
        try { await menuApi.deleteMenu(id); fetchMenus(); } catch (e) { console.error(e); }
    };

    /* ── category CRUD ── */
    const handleCreateCategory = async () => {
        if (!categoryForm.name.trim()) { setCategoryFormError("Name is required."); return; }
        if (!selectedPropertyId) return;
        setSavingCategory(true);
        try {
            await menuApi.createCategory({ propertyId: selectedPropertyId, name: categoryForm.name.trim() });
            setShowCategoryModal(false);
            setCategoryForm({ name: "" });
            setCategoryFormError("");
            fetchCategories();
        } catch (e) { console.error(e); setCategoryFormError("Failed to create category."); }
        finally { setSavingCategory(false); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Delete this category?")) return;
        try { await menuApi.deleteCategory(id); fetchCategories(); } catch (e) { console.error(e); }
    };

    /* ── item CRUD ── */
    const openCreateItem = () => {
        setEditingItem(null);
        setItemForm({ name: "", description: "", price: "", tag: "", calories: "", categoryId: "", menuId: "", isAvailable: true });
        setItemFormError("");
        setShowItemPanel(true);
    };

    const openEditItem = (item: AnyRecord) => {
        setEditingItem(item);
        setItemForm({
            name: item.name ?? "",
            description: item.description ?? "",
            price: item.price ?? "",
            tag: item.tag ?? "",
            calories: item.calories ?? "",
            categoryId: item.categoryId ?? item.category?.id ?? "",
            menuId: item.menuId ?? item.menu?.id ?? "",
            isAvailable: item.isAvailable ?? true,
        });
        setItemFormError("");
        setShowItemPanel(true);
    };

    const handleSaveItem = async () => {
        if (!itemForm.name.trim()) { setItemFormError("Name is required."); return; }
        if (!itemForm.price || isNaN(Number(itemForm.price))) { setItemFormError("A valid price is required."); return; }
        if (!selectedPropertyId) return;
        setSavingItem(true);
        const payload: AnyRecord = {
            name: itemForm.name.trim(),
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            tag: itemForm.tag || undefined,
            calories: itemForm.calories ? parseInt(itemForm.calories) : undefined,
            categoryId: itemForm.categoryId ? parseInt(itemForm.categoryId) : undefined,
            menuId: itemForm.menuId ? parseInt(itemForm.menuId) : undefined,
            isAvailable: itemForm.isAvailable,
            propertyId: selectedPropertyId,
        };
        try {
            if (editingItem) {
                await menuApi.updateItem(editingItem.id, payload);
            } else {
                await menuApi.createItem(payload);
            }
            setShowItemPanel(false);
            setItemFormError("");
            fetchItems();
        } catch (e) { console.error(e); setItemFormError("Failed to save item."); }
        finally { setSavingItem(false); }
    };

    const handleToggleAvailability = async (id: number) => {
        try { await menuApi.toggleItemAvailability(id); fetchItems(); } catch (e) { console.error(e); }
    };

    const handleDeleteItem = async (id: number) => {
        if (!window.confirm("Delete this item?")) return;
        try { await menuApi.deleteItem(id); fetchItems(); } catch (e) { console.error(e); }
    };

    /* ── selected property name ── */
    const selectedProperty = properties.find(p => (p.id ?? p.propertyId) === selectedPropertyId);

    /* ─────────────── render ─────────────── */
    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, background: "#faf9f7", overflow: "hidden", fontFamily: "sans-serif" }}>

            {/* ── Nav Sidebar ── */}
            <nav style={{ width: 170, background: "#fff", borderRight: "1px solid #e8e8e8", padding: "16px 0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "0 16px 20px" }}>
                    <Logo width={120} height={36} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 16px", fontSize: 13, textDecoration: "none",
                                transition: "all 0.15s", cursor: "pointer",
                                borderLeft: item.active ? "3px solid #953002" : "3px solid transparent",
                                background: item.active ? "rgba(149,48,2,0.08)" : "transparent",
                                color: item.active ? "#953002" : "#4f4f4f",
                                fontWeight: item.active ? 700 : 500,
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                {/* Top Bar */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "8px 32px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <a href="/owner/message" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", textDecoration: "none" }}>
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" style={{ display: "block", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "2px solid #953002" }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                        </a>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 40px" }}>
                    {/* Page Header */}
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1d1d1d", margin: 0, letterSpacing: 1 }}>MENU MANAGEMENT</h1>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#828282" }}>Manage your menus, categories, and items by property</p>
                    </div>

                    {/* Property Selector */}
                    <div style={{ marginBottom: 24, position: "relative", display: "inline-block" }}>
                        <button
                            onClick={() => setPropDropOpen(v => !v)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#1d1d1d", cursor: "pointer", minWidth: 220 }}
                        >
                            <Building2 size={15} color="#953002" />
                            <span style={{ flex: 1, textAlign: "left" }}>{selectedProperty ? (selectedProperty.name ?? selectedProperty.propertyName ?? "Property") : "Select a property…"}</span>
                            <ChevronDown size={15} color="#828282" />
                        </button>
                        {propDropOpen && (
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 200, minWidth: 220, overflow: "hidden" }}>
                                {properties.length === 0 && (
                                    <div style={{ padding: "12px 16px", fontSize: 13, color: "#828282" }}>No properties found</div>
                                )}
                                {properties.map(p => {
                                    const pid = p.id ?? p.propertyId;
                                    return (
                                        <button
                                            key={pid}
                                            onClick={() => { setSelectedPropertyId(pid); setPropDropOpen(false); }}
                                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: pid === selectedPropertyId ? "rgba(149,48,2,0.06)" : "transparent", border: "none", cursor: "pointer", fontSize: 13, color: pid === selectedPropertyId ? "#953002" : "#1d1d1d", fontWeight: pid === selectedPropertyId ? 700 : 400, textAlign: "left" }}
                                        >
                                            {pid === selectedPropertyId && <Check size={13} />}
                                            {p.name ?? p.propertyName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {selectedPropertyId && (
                        <>
                            {/* Tabs */}
                            <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e8e8e8", marginBottom: 24 }}>
                                {(["menus", "categories", "items"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: "10px 20px", background: "transparent", border: "none", cursor: "pointer",
                                            fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                                            color: activeTab === tab ? "#953002" : "#4f4f4f",
                                            borderBottom: activeTab === tab ? "2px solid #953002" : "2px solid transparent",
                                            marginBottom: -2, textTransform: "capitalize",
                                        }}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* ══ MENUS TAB ══ */}
                            {activeTab === "menus" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1d" }}>Menus</span>
                                        <button
                                            onClick={() => { setShowMenuModal(true); setMenuFormError(""); setMenuForm({ name: "", description: "", status: "active" }); }}
                                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#953002", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                                        >
                                            <Plus size={14} /> Create Menu
                                        </button>
                                    </div>

                                    {loadingMenus ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                                            <div style={{ width: 32, height: 32, border: "3px solid #e8e8e8", borderTop: "3px solid #953002", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                        </div>
                                    ) : menus.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "48px 0", color: "#828282" }}>
                                            <UtensilsCrossed size={40} color="#e0e0e0" style={{ marginBottom: 12 }} />
                                            <p style={{ margin: 0, fontSize: 14 }}>No menus yet. Create your first menu.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {menus.map(m => (
                                                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 18px" }}>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1d" }}>{m.name}</div>
                                                        {m.description && <div style={{ fontSize: 12, color: "#828282", marginTop: 2 }}>{m.description}</div>}
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
                                                            background: m.status === "active" ? "#e6f9ee" : "#f0f0f0",
                                                            color: m.status === "active" ? "#27ae60" : "#828282",
                                                        }}>
                                                            {(m.status ?? "draft").toUpperCase()}
                                                        </span>
                                                        <button onClick={() => handleDeleteMenu(m.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}>
                                                            <Trash2 size={15} color="#eb5757" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ══ CATEGORIES TAB ══ */}
                            {activeTab === "categories" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1d" }}>Categories</span>
                                        <button
                                            onClick={() => { setShowCategoryModal(true); setCategoryFormError(""); setCategoryForm({ name: "" }); }}
                                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#953002", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                                        >
                                            <Plus size={14} /> Create Category
                                        </button>
                                    </div>

                                    {loadingCategories ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                                            <div style={{ width: 32, height: 32, border: "3px solid #e8e8e8", borderTop: "3px solid #953002", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                        </div>
                                    ) : categories.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "48px 0", color: "#828282" }}>
                                            <Tag size={40} color="#e0e0e0" style={{ marginBottom: 12 }} />
                                            <p style={{ margin: 0, fontSize: 14 }}>No categories yet. Create your first category.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {categories.map(c => (
                                                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 18px" }}>
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1d" }}>{c.name}</span>
                                                    <button onClick={() => handleDeleteCategory(c.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}>
                                                        <Trash2 size={15} color="#eb5757" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ══ ITEMS TAB ══ */}
                            {activeTab === "items" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1d" }}>Menu Items</span>
                                        <button
                                            onClick={openCreateItem}
                                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#953002", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                                        >
                                            <Plus size={14} /> Add Item
                                        </button>
                                    </div>

                                    {loadingItems ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                                            <div style={{ width: 32, height: 32, border: "3px solid #e8e8e8", borderTop: "3px solid #953002", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "48px 0", color: "#828282" }}>
                                            <UtensilsCrossed size={40} color="#e0e0e0" style={{ marginBottom: 12 }} />
                                            <p style={{ margin: 0, fontSize: 14 }}>No items yet. Add your first menu item.</p>
                                        </div>
                                    ) : (
                                        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>ITEM</th>
                                                        <th style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>CATEGORY</th>
                                                        <th style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, padding: "12px 16px", textAlign: "right", borderBottom: "1px solid #e8e8e8" }}>PRICE</th>
                                                        <th style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #e8e8e8" }}>AVAILABLE</th>
                                                        <th style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #e8e8e8" }}>ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map(item => (
                                                        <tr key={item.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                                            <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                                    {item.imageUrl ? (
                                                                        <img src={item.imageUrl} alt={item.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #e8e8e8" }} />
                                                                    ) : (
                                                                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f5ede9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                            <UtensilsCrossed size={18} color="#953002" />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1d" }}>{item.name}</div>
                                                                        {item.tag && <div style={{ fontSize: 11, color: "#953002", fontWeight: 600 }}>{item.tag}</div>}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: "12px 16px", fontSize: 13, color: "#4f4f4f", verticalAlign: "middle" }}>
                                                                {item.category?.name ?? item.categoryName ?? "—"}
                                                            </td>
                                                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1d1d1d", textAlign: "right", verticalAlign: "middle" }}>
                                                                Rs. {parseFloat(item.price ?? 0).toFixed(2)}
                                                            </td>
                                                            <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                                                                <button
                                                                    onClick={() => handleToggleAvailability(item.id)}
                                                                    style={{
                                                                        width: 40, height: 22, borderRadius: 11,
                                                                        background: item.isAvailable ? "#953002" : "#e0e0e0",
                                                                        border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                                                                    }}
                                                                >
                                                                    <span style={{
                                                                        position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff",
                                                                        transition: "left 0.2s", left: item.isAvailable ? 20 : 2,
                                                                    }} />
                                                                </button>
                                                            </td>
                                                            <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                                                                <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                                                                    <button onClick={() => openEditItem(item)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}>
                                                                        <Pencil size={15} color="#4f4f4f" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteItem(item.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}>
                                                                        <Trash2 size={15} color="#eb5757" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {!selectedPropertyId && properties.length === 0 && (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#828282" }}>
                            <AlertCircle size={40} color="#e0e0e0" style={{ marginBottom: 12 }} />
                            <p style={{ margin: 0, fontSize: 14 }}>No properties found. Add a property first.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* ══ Create Menu Modal ══ */}
            {showMenuModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.40)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 14, width: 420, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#1d1d1d" }}>Create Menu</span>
                            <button onClick={() => setShowMenuModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#828282" /></button>
                        </div>
                        {menuFormError && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff3f3", border: "1px solid #ffc0c0", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 13, color: "#eb5757" }}>
                                <AlertCircle size={14} />{menuFormError}
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Name <span style={{ color: "#eb5757" }}>*</span></label>
                                <input
                                    value={menuForm.name}
                                    onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Breakfast Menu"
                                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Description</label>
                                <textarea
                                    value={menuForm.description}
                                    onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Optional description"
                                    rows={3}
                                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Status</label>
                                <select
                                    value={menuForm.status}
                                    onChange={e => setMenuForm(f => ({ ...f, status: e.target.value }))}
                                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
                            <button onClick={() => setShowMenuModal(false)} style={{ padding: "9px 20px", background: "transparent", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#4f4f4f", cursor: "pointer" }}>Cancel</button>
                            <button onClick={handleCreateMenu} disabled={savingMenu} style={{ padding: "9px 20px", background: savingMenu ? "#c0a090" : "#953002", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: savingMenu ? "not-allowed" : "pointer" }}>
                                {savingMenu ? "Saving…" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Create Category Modal ══ */}
            {showCategoryModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.40)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 14, width: 380, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#1d1d1d" }}>Create Category</span>
                            <button onClick={() => setShowCategoryModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#828282" /></button>
                        </div>
                        {categoryFormError && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff3f3", border: "1px solid #ffc0c0", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 13, color: "#eb5757" }}>
                                <AlertCircle size={14} />{categoryFormError}
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Name <span style={{ color: "#eb5757" }}>*</span></label>
                            <input
                                value={categoryForm.name}
                                onChange={e => setCategoryForm({ name: e.target.value })}
                                placeholder="e.g. Starters"
                                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
                            <button onClick={() => setShowCategoryModal(false)} style={{ padding: "9px 20px", background: "transparent", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#4f4f4f", cursor: "pointer" }}>Cancel</button>
                            <button onClick={handleCreateCategory} disabled={savingCategory} style={{ padding: "9px 20px", background: savingCategory ? "#c0a090" : "#953002", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: savingCategory ? "not-allowed" : "pointer" }}>
                                {savingCategory ? "Saving…" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Item Side Panel ══ */}
            {showItemPanel && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 500, display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#fff", width: 420, height: "100%", overflowY: "auto", padding: 28, boxShadow: "-4px 0 24px rgba(0,0,0,0.14)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#1d1d1d" }}>{editingItem ? "Edit Item" : "Add Item"}</span>
                            <button onClick={() => setShowItemPanel(false)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#828282" /></button>
                        </div>
                        {itemFormError && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff3f3", border: "1px solid #ffc0c0", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 13, color: "#eb5757" }}>
                                <AlertCircle size={14} />{itemFormError}
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Name <span style={{ color: "#eb5757" }}>*</span></label>
                                <input value={itemForm.name} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, name: e.target.value }))} placeholder="Item name" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Description</label>
                                <textarea value={itemForm.description} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, description: e.target.value }))} placeholder="Optional description" rows={3} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "sans-serif" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Price (Rs.) <span style={{ color: "#eb5757" }}>*</span></label>
                                <input type="number" min="0" step="0.01" value={itemForm.price} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, price: e.target.value }))} placeholder="0.00" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Tag</label>
                                    <input value={itemForm.tag} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, tag: e.target.value }))} placeholder="e.g. Vegan" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Calories</label>
                                    <input type="number" min="0" value={itemForm.calories} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, calories: e.target.value }))} placeholder="kcal" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Category</label>
                                <select value={itemForm.categoryId} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, categoryId: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
                                    <option value="">— None —</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#4f4f4f", display: "block", marginBottom: 6 }}>Menu</label>
                                <select value={itemForm.menuId} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, menuId: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
                                    <option value="">— None —</option>
                                    {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input type="checkbox" id="isAvailable" checked={itemForm.isAvailable} onChange={e => setItemForm((f: AnyRecord) => ({ ...f, isAvailable: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#953002", cursor: "pointer" }} />
                                <label htmlFor="isAvailable" style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1d", cursor: "pointer" }}>Available</label>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "flex-end" }}>
                            <button onClick={() => setShowItemPanel(false)} style={{ padding: "9px 20px", background: "transparent", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#4f4f4f", cursor: "pointer" }}>Cancel</button>
                            <button onClick={handleSaveItem} disabled={savingItem} style={{ padding: "9px 20px", background: savingItem ? "#c0a090" : "#953002", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: savingItem ? "not-allowed" : "pointer" }}>
                                {savingItem ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
