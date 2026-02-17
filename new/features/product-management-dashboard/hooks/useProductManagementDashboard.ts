import { useState, useCallback, useMemo } from "react";
import type { ProjectRepository } from "@/new/api/project-repository";
import type { Product, MachineMaster } from "@/new/api/types";
import type { BannerEditState } from "@/features/product-management-dashboard/model/types";

export type TabValue = "machineMaster" | "projectMachines";

const DEFAULT_BANNER_EDIT: BannerEditState = {
  productId: null,
  date: "2/1",
  dayOfWeek: "日曜日",
  prefecture: "長野県",
  storeName: "",
  targetMachines: [""],
};

export interface BannerModalData {
  productId: number;
  date: string;
  dayOfWeek: string;
  prefecture: string;
  storeName: string;
  targetMachines: string[];
}

export interface ProductMachineViewModel {
  productId: number;
  productName: string;
  eventDate: string;
  displayDate: string;
  displayDayOfWeek: string;
  targetMachineNames: string[];
  pachitownMachineNames: string[];
  isMachineRegistered: boolean;
  isPachitownLinked: boolean;
  isBannerCreated: boolean;
  projectName: string;
  prefecture: string;
  storeName: string;
}

function getDateAndDayOfWeek(eventDate: string): {
  date: string;
  dayOfWeek: string;
} {
  const dayNames = [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ];
  try {
    const parts = eventDate.split("/");
    if (parts.length !== 3) return { date: eventDate, dayOfWeek: "" };
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month - 1, day);
    return {
      date: `${month}/${day}`,
      dayOfWeek: dayNames[d.getDay()],
    };
  } catch {
    return { date: eventDate, dayOfWeek: "" };
  }
}

export function useProductManagementDashboard(repository: ProjectRepository) {
  const [activeTab, setActiveTab] = useState<TabValue>("machineMaster");
  const [newMasterName, setNewMasterName] = useState("");
  const [newMasterPachitownName, setNewMasterPachitownName] = useState("");
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerModalData, setBannerModalData] =
    useState<BannerModalData | null>(null);
  const [editingMachineNames, setEditingMachineNames] = useState<
    Record<number, string[]>
  >({});

  // ─── リフレッシュ（repository更新後にデータ再取得を強制する） ───
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const machineMasters = useMemo(() => repository.getMachineMasters(), [repository, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allProducts = useMemo(() => repository.getProducts(), [repository, refreshKey]);

  const slotSelectProducts = useMemo(() => {
    return allProducts.filter((p) => p.eventType === "スロセレ");
  }, [allProducts]);

  const productViewModels: ProductMachineViewModel[] = useMemo(() => {
    return slotSelectProducts.map((product) => {
      const targetMachines = product.targetMachineNames ?? [];
      const pachitownNames = product.pachitownMachineNames ?? [];
      const { date, dayOfWeek } = product.eventStartDate
        ? getDateAndDayOfWeek(product.eventStartDate)
        : { date: "", dayOfWeek: "" };
      const project = repository.getProjectByProjectNumber(product.projectNumber);
      const projectName = project?.projectName ?? product.eventProductName ?? "";
      const prefecture = product.bannerData?.prefecture ?? "長野県";
      const storeName = product.bannerData?.storeName ?? project?.hallName ?? "";

      return {
        productId: product.id,
        productName: product.eventProductName,
        eventDate: product.eventStartDate ?? "",
        displayDate: date,
        displayDayOfWeek: dayOfWeek,
        targetMachineNames: targetMachines,
        pachitownMachineNames: pachitownNames,
        isMachineRegistered: targetMachines.length > 0,
        isPachitownLinked: product.pachitownLinked === true,
        isBannerCreated: product.bannerGenerated === true,
        projectName,
        prefecture,
        storeName,
      };
    });
  }, [slotSelectProducts, repository]);

  const addMachineMaster = useCallback(() => {
    if (!newMasterName.trim()) return;
    const newMaster: MachineMaster = {
      id: Date.now(),
      name: newMasterName.trim(),
      pachitownName: newMasterPachitownName.trim() || newMasterName.trim(),
    };
    const updated = [...machineMasters, newMaster];
    repository.saveMachineMasters(updated);
    setNewMasterName("");
    setNewMasterPachitownName("");
    refresh();
  }, [
    machineMasters,
    newMasterName,
    newMasterPachitownName,
    repository,
    refresh,
  ]);

  const deleteMachineMaster = useCallback(
    (masterId: number) => {
      const updated = machineMasters.filter((m) => m.id !== masterId);
      repository.saveMachineMasters(updated);
      refresh();
    },
    [machineMasters, repository, refresh]
  );

  const autoConvertMachines = useCallback(
    (productId: number) => {
      const product = allProducts.find((p) => p.id === productId);
      if (!product) return;
      const targetNames = product.targetMachineNames ?? [];
      const convertedNames = targetNames.map((name) => {
        const master = machineMasters.find((m) => m.name === name);
        return master ? master.pachitownName : name;
      });
      repository.updateProduct(productId, {
        pachitownMachineNames: convertedNames,
      });
      setEditingMachineNames((prev) => ({
        ...prev,
        [productId]: convertedNames,
      }));
      refresh();
    },
    [allProducts, machineMasters, repository, refresh]
  );

  const updatePachitownMachineNames = useCallback(
    (productId: number, names: string[]) => {
      setEditingMachineNames((prev) => ({ ...prev, [productId]: names }));
    },
    []
  );

  const savePachitownMachineNames = useCallback(
    (productId: number) => {
      const names = editingMachineNames[productId];
      if (!names) return;
      repository.updateProduct(productId, { pachitownMachineNames: names });
      refresh();
    },
    [editingMachineNames, repository, refresh]
  );

  const handlePachitownLink = useCallback(
    (productId: number) => {
      const linkedDate = new Date().toISOString().split("T")[0];
      repository.updateProduct(productId, {
        pachitownLinked: true,
        pachitownLinkedDate: linkedDate,
      });
      refresh();
    },
    [repository, refresh]
  );

  // 機種名のインライン編集（旧 View 用）
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingMachineIndex, setEditingMachineIndex] = useState<number | null>(null);
  const [editingMachineName, setEditingMachineName] = useState("");

  const handleStartEditMachine = useCallback((productId: number, index: number, currentName: string) => {
    setEditingProductId(productId);
    setEditingMachineIndex(index);
    setEditingMachineName(currentName);
  }, []);

  const handleEditMachineNameChange = useCallback((value: string) => {
    setEditingMachineName(value);
  }, []);

  const handleSaveEditMachine = useCallback(
    (productId: number, index: number) => {
      const product = allProducts.find((p) => p.id === productId);
      if (!product) return;
      const pachitownMachineNames = [...(product.pachitownMachineNames ?? [])];
      pachitownMachineNames[index] = editingMachineName.trim();
      repository.updateProduct(productId, { pachitownMachineNames });
      setEditingProductId(null);
      setEditingMachineIndex(null);
      setEditingMachineName("");
      refresh();
    },
    [allProducts, editingMachineName, repository, refresh]
  );

  const handleCancelEditMachine = useCallback(() => {
    setEditingProductId(null);
    setEditingMachineIndex(null);
    setEditingMachineName("");
  }, []);

  // チャットドロワー
  const [chatProductId, setChatProductId] = useState<number | null>(null);
  const [chatProductName, setChatProductName] = useState("");
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  const openChatDrawer = useCallback(
    (productId: number) => {
      const product = allProducts.find((p) => p.id === productId);
      if (!product) return;
      setChatProductId(productId);
      setChatProductName(product.eventProductName || product.eventType);
      setShowChatDrawer(true);
    },
    [allProducts]
  );

  // バナー編集状態（旧 View の BannerCreateModal 用）
  const [bannerEdit, setBannerEdit] = useState<BannerEditState>(DEFAULT_BANNER_EDIT);

  const updateBannerEdit = useCallback((updates: Partial<BannerEditState>) => {
    setBannerEdit((prev) => ({ ...prev, ...updates }));
  }, []);

  const openBannerModal = useCallback(
    (productId: number) => {
      const vm = productViewModels.find((p) => p.productId === productId);
      if (!vm) return;
      setBannerEdit({
        ...DEFAULT_BANNER_EDIT,
        productId,
        date: vm.displayDate || "2/1",
        dayOfWeek: vm.displayDayOfWeek || "日曜日",
        prefecture: vm.prefecture || "長野県",
        storeName: vm.storeName || "",
        targetMachines:
          vm.pachitownMachineNames.length > 0
            ? [...vm.pachitownMachineNames]
            : vm.targetMachineNames.length > 0
              ? [...vm.targetMachineNames]
              : [""],
      });
      setBannerModalData({
        productId,
        date: vm.displayDate,
        dayOfWeek: vm.displayDayOfWeek,
        prefecture: vm.prefecture,
        storeName: vm.storeName,
        targetMachines:
          vm.pachitownMachineNames.length > 0 ? vm.pachitownMachineNames : vm.targetMachineNames,
      });
      setBannerModalOpen(true);
    },
    [productViewModels]
  );

  const closeBannerModal = useCallback(() => {
    if (bannerEdit.productId != null) {
      const data = {
        date: bannerEdit.date,
        dayOfWeek: bannerEdit.dayOfWeek,
        prefecture: bannerEdit.prefecture,
        storeName: bannerEdit.storeName,
        targetMachines: bannerEdit.targetMachines.filter((s) => s.trim()),
      };
      repository.updateProduct(bannerEdit.productId, {
        bannerGenerated: true,
        bannerData: data,
      });
    }
    setBannerModalOpen(false);
    setBannerModalData(null);
    setBannerEdit(DEFAULT_BANNER_EDIT);
    refresh();
  }, [bannerEdit, repository, refresh]);

  const onBannerModalOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setBannerModalOpen(false);
      setBannerModalData(null);
      setBannerEdit(DEFAULT_BANNER_EDIT);
    }
  }, []);

  const saveBanner = useCallback(
    (productId: number) => {
      const data = {
        date: bannerEdit.date,
        dayOfWeek: bannerEdit.dayOfWeek,
        prefecture: bannerEdit.prefecture,
        storeName: bannerEdit.storeName,
        targetMachines: bannerEdit.targetMachines.filter((s) => s.trim()),
      };
      repository.updateProduct(productId, { bannerGenerated: true, bannerData: data });
      setBannerModalOpen(false);
      setBannerModalData(null);
      setBannerEdit(DEFAULT_BANNER_EDIT);
      refresh();
    },
    [bannerEdit, repository, refresh]
  );

  return {
    activeTab,
    setActiveTab,
    machineMasters,
    newMasterName,
    setNewMasterName,
    newMasterPachitownName,
    setNewMasterPachitownName,
    addMachineMaster,
    deleteMachineMaster,
    products: slotSelectProducts,
    productViewModels,
    autoConvertMachines,
    editingMachineNames,
    updatePachitownMachineNames,
    savePachitownMachineNames,
    handlePachitownLink,
    bannerModalOpen,
    setBannerModalOpen,
    onBannerModalOpenChange,
    bannerModalData,
    bannerEdit,
    updateBannerEdit,
    openBannerModal,
    closeBannerModal,
    saveBanner,
    // チャット
    chatProductId,
    chatProductName,
    showChatDrawer,
    setShowChatDrawer,
    openChatDrawer,
    // 旧 View 用（インライン機種名編集）
    editingProductId,
    editingMachineIndex,
    editingMachineName,
    handleStartEditMachine,
    handleEditMachineNameChange,
    handleSaveEditMachine,
    handleCancelEditMachine,
  };
}

export type UseProductManagementDashboardReturn = ReturnType<
  typeof useProductManagementDashboard
>;
