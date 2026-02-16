import { useState, useEffect, useCallback, useMemo } from "react";
import type { ProjectRepository } from "@/new/api/project-repository";
import type { Product, MachineMaster } from "@/new/api/types";

export type TabValue = "machineMaster" | "projectMachines";

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
  const [machineMasters, setMachineMasters] = useState<MachineMaster[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newMasterName, setNewMasterName] = useState("");
  const [newMasterPachitownName, setNewMasterPachitownName] = useState("");
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerModalData, setBannerModalData] =
    useState<BannerModalData | null>(null);
  const [editingMachineNames, setEditingMachineNames] = useState<
    Record<number, string[]>
  >({});

  const loadData = useCallback(() => {
    const masters = repository.getMachineMasters();
    setMachineMasters(masters);
    const allProducts = repository.getProducts();
    setProducts(allProducts);
  }, [repository]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const slotSelectProducts = useMemo(() => {
    return products.filter((p) => p.eventType === "スロセレ");
  }, [products]);

  const productViewModels: ProductMachineViewModel[] = useMemo(() => {
    return slotSelectProducts.map((product) => {
      const targetMachines = product.targetMachineNames ?? [];
      const pachitownNames = product.pachitownMachineNames ?? [];
      const { date, dayOfWeek } = product.eventStartDate
        ? getDateAndDayOfWeek(product.eventStartDate)
        : { date: "", dayOfWeek: "" };

      return {
        productId: product.id,
        productName: product.name,
        eventDate: product.eventStartDate ?? "",
        displayDate: date,
        displayDayOfWeek: dayOfWeek,
        targetMachineNames: targetMachines,
        pachitownMachineNames: pachitownNames,
        isMachineRegistered: targetMachines.length > 0,
        isPachitownLinked: product.pachitownLinked === true,
        isBannerCreated: product.bannerCreated === true,
        projectName: product.projectName ?? "",
        prefecture: product.prefecture ?? "",
        storeName: product.storeName ?? "",
      };
    });
  }, [slotSelectProducts]);

  const addMachineMaster = useCallback(() => {
    if (!newMasterName.trim()) return;
    const newMaster: MachineMaster = {
      id: Date.now(),
      name: newMasterName.trim(),
      pachitownName: newMasterPachitownName.trim() || newMasterName.trim(),
    };
    const updated = [...machineMasters, newMaster];
    repository.saveMachineMasters(updated);
    setMachineMasters(updated);
    setNewMasterName("");
    setNewMasterPachitownName("");
  }, [
    machineMasters,
    newMasterName,
    newMasterPachitownName,
    repository,
  ]);

  const deleteMachineMaster = useCallback(
    (masterId: number) => {
      const updated = machineMasters.filter((m) => m.id !== masterId);
      repository.saveMachineMasters(updated);
      setMachineMasters(updated);
    },
    [machineMasters, repository]
  );

  const autoConvertMachines = useCallback(
    (productId: number) => {
      const product = products.find((p) => p.id === productId);
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
      loadData();
    },
    [products, machineMasters, repository, loadData]
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
      loadData();
    },
    [editingMachineNames, repository, loadData]
  );

  const handlePachitownLink = useCallback(
    (productId: number) => {
      repository.updateProduct(productId, { pachitownLinked: true });
      loadData();
    },
    [repository, loadData]
  );

  const openBannerModal = useCallback(
    (productId: number) => {
      const vm = productViewModels.find((p) => p.productId === productId);
      if (!vm) return;
      setBannerModalData({
        productId,
        date: vm.displayDate,
        dayOfWeek: vm.displayDayOfWeek,
        prefecture: vm.prefecture,
        storeName: vm.storeName,
        targetMachines: vm.pachitownMachineNames.length > 0
          ? vm.pachitownMachineNames
          : vm.targetMachineNames,
      });
      setBannerModalOpen(true);
    },
    [productViewModels]
  );

  const closeBannerModal = useCallback(() => {
    setBannerModalOpen(false);
    setBannerModalData(null);
  }, []);

  const saveBanner = useCallback(
    (productId: number) => {
      repository.updateProduct(productId, { bannerCreated: true });
      setBannerModalOpen(false);
      setBannerModalData(null);
      loadData();
    },
    [repository, loadData]
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
    productViewModels,
    autoConvertMachines,
    editingMachineNames,
    updatePachitownMachineNames,
    savePachitownMachineNames,
    handlePachitownLink,
    bannerModalOpen,
    bannerModalData,
    openBannerModal,
    closeBannerModal,
    saveBanner,
  };
}

export type UseProductManagementDashboardReturn = ReturnType<
  typeof useProductManagementDashboard
>;
