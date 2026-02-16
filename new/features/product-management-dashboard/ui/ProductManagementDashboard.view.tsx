import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  TabValue,
  BannerModalData,
  ProductMachineViewModel,
} from "../hooks/useProductManagementDashboard";
import type { MachineMaster } from "@/new/api/types";
import { Trash2, Zap, ExternalLink, Image } from "lucide-react";

// ─── Sub-components ──────────────────────────────────────────────

interface MachineMasterTableProps {
  machineMasters: MachineMaster[];
  onDelete: (id: number) => void;
}

const MachineMasterTable = ({
  machineMasters,
  onDelete,
}: MachineMasterTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40%]">機種名</TableHead>
        <TableHead className="w-[40%]">パチタウン名</TableHead>
        <TableHead className="w-[20%] text-right">操作</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {machineMasters.length === 0 ? (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-muted-foreground">
            機種マスタが登録されていません
          </TableCell>
        </TableRow>
      ) : (
        machineMasters.map((master) => (
          <TableRow key={master.id}>
            <TableCell className="font-medium">{master.name}</TableCell>
            <TableCell>{master.pachitownName}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(master.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

interface AddMasterFormProps {
  newMasterName: string;
  newMasterPachitownName: string;
  onNameChange: (value: string) => void;
  onPachitownNameChange: (value: string) => void;
  onAdd: () => void;
}

const AddMasterForm = ({
  newMasterName,
  newMasterPachitownName,
  onNameChange,
  onPachitownNameChange,
  onAdd,
}: AddMasterFormProps) => (
  <div className="flex gap-2 items-end">
    <div className="flex-1">
      <label className="text-sm font-medium mb-1 block">機種名</label>
      <Input
        placeholder="例: バジリスク絆2"
        value={newMasterName}
        onChange={(e) => onNameChange(e.target.value)}
      />
    </div>
    <div className="flex-1">
      <label className="text-sm font-medium mb-1 block">パチタウン名</label>
      <Input
        placeholder="例: バジリスク～甲賀忍法帖～絆2"
        value={newMasterPachitownName}
        onChange={(e) => onPachitownNameChange(e.target.value)}
      />
    </div>
    <Button onClick={onAdd} disabled={!newMasterName.trim()}>
      追加
    </Button>
  </div>
);

interface StatusBadgesProps {
  isMachineRegistered: boolean;
  isPachitownLinked: boolean;
  isBannerCreated: boolean;
}

const StatusBadges = ({
  isMachineRegistered,
  isPachitownLinked,
  isBannerCreated,
}: StatusBadgesProps) => (
  <div className="flex gap-2 flex-wrap">
    <Badge variant={isMachineRegistered ? "default" : "secondary"}>
      {isMachineRegistered ? "機種登録済み" : "機種未登録"}
    </Badge>
    <Badge variant={isPachitownLinked ? "default" : "secondary"}>
      {isPachitownLinked ? "パチタウン連携済み" : "パチタウン未連携"}
    </Badge>
    <Badge variant={isBannerCreated ? "default" : "secondary"}>
      {isBannerCreated ? "バナー作成済み" : "バナー未作成"}
    </Badge>
  </div>
);

interface MachineListProps {
  label: string;
  machines: string[];
}

const MachineList = ({ label, machines }: MachineListProps) => (
  <div>
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <div className="flex gap-1 flex-wrap mt-1">
      {machines.length > 0 ? (
        machines.map((name, i) => (
          <Badge key={i} variant="outline">
            {name}
          </Badge>
        ))
      ) : (
        <span className="text-sm text-muted-foreground">なし</span>
      )}
    </div>
  </div>
);

interface PachitownMachineEditProps {
  productId: number;
  currentNames: string[];
  editingNames: string[] | undefined;
  onUpdate: (productId: number, names: string[]) => void;
  onSave: (productId: number) => void;
}

const PachitownMachineEdit = ({
  productId,
  currentNames,
  editingNames,
  onUpdate,
  onSave,
}: PachitownMachineEditProps) => {
  const names = editingNames ?? currentNames;
  if (names.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground">
        パチタウン機種名（編集可能）
      </span>
      <div className="space-y-1">
        {names.map((name, i) => (
          <Input
            key={i}
            value={name}
            onChange={(e) => {
              const updated = [...names];
              updated[i] = e.target.value;
              onUpdate(productId, updated);
            }}
            className="h-8 text-sm"
          />
        ))}
      </div>
      {editingNames && (
        <Button size="sm" variant="outline" onClick={() => onSave(productId)}>
          保存
        </Button>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: ProductMachineViewModel;
  editingNames: string[] | undefined;
  onAutoConvert: (productId: number) => void;
  onPachitownLink: (productId: number) => void;
  onOpenBanner: (productId: number) => void;
  onUpdateNames: (productId: number, names: string[]) => void;
  onSaveNames: (productId: number) => void;
}

const ProductCard = ({
  product,
  editingNames,
  onAutoConvert,
  onPachitownLink,
  onOpenBanner,
  onUpdateNames,
  onSaveNames,
}: ProductCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base">{product.productName}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {product.projectName && `${product.projectName} / `}
            {product.eventDate && (
              <>
                {product.displayDate}（{product.displayDayOfWeek}）
              </>
            )}
          </p>
          {(product.prefecture || product.storeName) && (
            <p className="text-sm text-muted-foreground">
              {product.prefecture} {product.storeName}
            </p>
          )}
        </div>
        <StatusBadges
          isMachineRegistered={product.isMachineRegistered}
          isPachitownLinked={product.isPachitownLinked}
          isBannerCreated={product.isBannerCreated}
        />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MachineList
          label="顧客入力（対象機種）"
          machines={product.targetMachineNames}
        />
        <MachineList
          label="変換後（パチタウン機種）"
          machines={product.pachitownMachineNames}
        />
      </div>

      <PachitownMachineEdit
        productId={product.productId}
        currentNames={product.pachitownMachineNames}
        editingNames={editingNames}
        onUpdate={onUpdateNames}
        onSave={onSaveNames}
      />

      <div className="flex gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAutoConvert(product.productId)}
          disabled={product.targetMachineNames.length === 0}
        >
          <Zap className="h-4 w-4 mr-1" />
          機種変換
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPachitownLink(product.productId)}
          disabled={product.isPachitownLinked}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          パチタウン連携
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenBanner(product.productId)}
        >
          <Image className="h-4 w-4 mr-1" />
          バナー作成
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface BannerCreateModalProps {
  open: boolean;
  data: BannerModalData | null;
  onClose: () => void;
  onSave: (productId: number) => void;
}

const BannerCreateModal = ({
  open,
  data,
  onClose,
  onSave,
}: BannerCreateModalProps) => {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>バナー作成</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">日付</label>
              <Input value={data.date} readOnly className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">曜日</label>
              <Input value={data.dayOfWeek} readOnly className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">都道府県</label>
              <Input value={data.prefecture} readOnly className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">店舗名</label>
              <Input value={data.storeName} readOnly className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">対象機種</label>
            <div className="mt-1 space-y-1">
              {data.targetMachines.length > 0 ? (
                data.targetMachines.map((name, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 bg-muted rounded-md text-sm"
                  >
                    {name}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  対象機種がありません
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={() => onSave(data.productId)}>
            バナーを作成する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main View ───────────────────────────────────────────────────

export interface ProductManagementDashboardViewProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  machineMasters: MachineMaster[];
  newMasterName: string;
  newMasterPachitownName: string;
  onNewMasterNameChange: (value: string) => void;
  onNewMasterPachitownNameChange: (value: string) => void;
  onAddMaster: () => void;
  onDeleteMaster: (id: number) => void;
  productViewModels: ProductMachineViewModel[];
  editingMachineNames: Record<number, string[]>;
  onAutoConvert: (productId: number) => void;
  onUpdatePachitownNames: (productId: number, names: string[]) => void;
  onSavePachitownNames: (productId: number) => void;
  onPachitownLink: (productId: number) => void;
  onOpenBanner: (productId: number) => void;
  bannerModalOpen: boolean;
  bannerModalData: BannerModalData | null;
  onCloseBanner: () => void;
  onSaveBanner: (productId: number) => void;
}

export const ProductManagementDashboardView = ({
  activeTab,
  onTabChange,
  machineMasters,
  newMasterName,
  newMasterPachitownName,
  onNewMasterNameChange,
  onNewMasterPachitownNameChange,
  onAddMaster,
  onDeleteMaster,
  productViewModels,
  editingMachineNames,
  onAutoConvert,
  onUpdatePachitownNames,
  onSavePachitownNames,
  onPachitownLink,
  onOpenBanner,
  bannerModalOpen,
  bannerModalData,
  onCloseBanner,
  onSaveBanner,
}: ProductManagementDashboardViewProps) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">商材管理課ダッシュボード</h1>
      <p className="text-muted-foreground mt-1">
        機種マスタ管理とスロセレ案件の機種変換・パチタウン連携を行います
      </p>
    </div>

    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as TabValue)}
    >
      <TabsList>
        <TabsTrigger value="machineMaster">機種マスタ</TabsTrigger>
        <TabsTrigger value="projectMachines">スロセレの案件</TabsTrigger>
      </TabsList>

      <TabsContent value="machineMaster" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>機種マスタ一覧</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MachineMasterTable
              machineMasters={machineMasters}
              onDelete={onDeleteMaster}
            />
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">新規機種マスタ追加</h3>
              <AddMasterForm
                newMasterName={newMasterName}
                newMasterPachitownName={newMasterPachitownName}
                onNameChange={onNewMasterNameChange}
                onPachitownNameChange={onNewMasterPachitownNameChange}
                onAdd={onAddMaster}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projectMachines" className="space-y-4 mt-4">
        {productViewModels.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              スロセレの案件がありません
            </CardContent>
          </Card>
        ) : (
          productViewModels.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              editingNames={editingMachineNames[product.productId]}
              onAutoConvert={onAutoConvert}
              onPachitownLink={onPachitownLink}
              onOpenBanner={onOpenBanner}
              onUpdateNames={onUpdatePachitownNames}
              onSaveNames={onSavePachitownNames}
            />
          ))
        )}
      </TabsContent>
    </Tabs>

    <BannerCreateModal
      open={bannerModalOpen}
      data={bannerModalData}
      onClose={onCloseBanner}
      onSave={onSaveBanner}
    />
  </div>
);
