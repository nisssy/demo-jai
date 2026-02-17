import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, FileText, Mail, ArrowLeft, Download, ArrowRight, Send } from "lucide-react"
import type { ProjectData } from "@/types/project"

export type QuoteCreationViewProps = {
  projectData: ProjectData
  showPDF: boolean
  quoteGenerated: boolean
  emailGenerated: boolean
  activeTab: "quote" | "email"
  onActiveTabChange: (tab: "quote" | "email") => void
  isLoadingSend: boolean
  totalAmount: number
  onGenerateQuote: () => void
  onGenerateEmail: () => void
  onSendQuote: () => void
  onEmailDraftChange: (value: string) => void
  onBack: () => void
}

export const QuoteCreationView = ({
  projectData,
  showPDF,
  quoteGenerated,
  emailGenerated,
  activeTab,
  onActiveTabChange,
  isLoadingSend,
  totalAmount,
  onGenerateQuote,
  onGenerateEmail,
  onSendQuote,
  onEmailDraftChange,
  onBack,
}: QuoteCreationViewProps) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {isLoadingSend && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">見積書を送付中...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">見積作成・送付</h1>
          <p className="text-slate-600">AIを活用して見積書を自動生成し、送付します</p>
        </div>
      </div>

      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Step 4-5: 見積書生成・送付（AI活用）</CardTitle>
          </div>
          <CardDescription>見積書PDFとメール文面をAIが自動生成します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={onGenerateQuote} variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              見積書生成
            </Button>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <Button
              onClick={onGenerateEmail}
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={!quoteGenerated}
            >
              <Sparkles className="h-4 w-4" />
              メール文面を生成
            </Button>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <Button onClick={onSendQuote} className="gap-2" disabled={!quoteGenerated || !emailGenerated}>
              <Send className="h-4 w-4" />
              見積書送付
            </Button>
          </div>

          {(quoteGenerated || emailGenerated) && (
            <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as "quote" | "email")} className="w-full">
              <div className="border-b border-slate-100 mb-8">
                <TabsList className="bg-transparent h-auto p-0 gap-0">
                  <TabsTrigger
                    value="quote"
                    disabled={!quoteGenerated}
                    className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    見積書プレビュー
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    disabled={!emailGenerated}
                    className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    メールプレビュー
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="quote" className="mt-0 space-y-3">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">見積書PDF生成完了</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    ダウンロード
                  </Button>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-slate-100 p-2 text-center text-xs text-slate-600 border-b border-slate-300">
                    PDFプレビュー - quote_288.pdf
                  </div>
                  <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto">
                    <div className="text-center space-y-2 pb-6 border-b-2 border-slate-200">
                      <h2 className="text-2xl font-bold text-slate-900">御見積書</h2>
                      <p className="text-sm text-slate-600">Quote No. 288</p>
                      <p className="text-sm text-slate-600">発行日: {new Date().toLocaleDateString("ja-JP")}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-900">{projectData.clientName} 御中</p>
                        <p className="text-sm text-slate-600">下記の通りお見積もりいたします。</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">案件名:</span>
                          <span className="font-medium">{projectData.projectName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">実施日:</span>
                          <span className="font-medium">{projectData.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">会場:</span>
                          <span className="font-medium">{projectData.venue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">コンパニオン:</span>
                          <span className="font-medium">{projectData.talent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-900">見積明細</h3>
                      <table className="w-full border border-slate-300">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium text-slate-700 border-b border-slate-300">項目</th>
                            <th className="text-right p-3 text-sm font-medium text-slate-700 border-b border-slate-300">金額</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectData.quoteItems?.map((item, idx) => (
                            <>
                              <tr key={idx} className="border-b border-slate-200">
                                <td className="p-3 text-sm font-medium">{item.item}</td>
                                <td className="p-3 text-sm text-right font-medium">¥{item.amount.toLocaleString()}</td>
                              </tr>
                              {item.subitems?.map((subitem: { item: string; amount: number }, subIdx: number) => (
                                <tr key={`${idx}-${subIdx}`} className="border-b border-slate-100 bg-slate-50/50">
                                  <td className="p-2 pl-6 text-sm text-slate-600">{subitem.item}</td>
                                  <td className="p-2 text-sm text-right text-slate-600">¥{subitem.amount.toLocaleString()}</td>
                                </tr>
                              ))}
                            </>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-400">
                          <tr>
                            <td className="p-3 text-sm font-bold">合計金額（税込）</td>
                            <td className="p-3 text-sm text-right font-bold text-blue-600 text-lg">
                              ¥{totalAmount.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="pt-6 border-t border-slate-200 space-y-3 text-sm text-slate-600">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">お支払い条件</p>
                        <p>- 請求書発行後30日以内にお支払いください</p>
                        <p>- 振込手数料は貴社ご負担でお願いいたします</p>
                      </div>
                      <div className="space-y-1 pt-4">
                        <p className="font-medium text-slate-900">発行元</p>
                        <p>DMM 株式会社</p>
                        <p>〒150-0001 東京都渋谷区神宮前1-1-1</p>
                        <p>TEL: 03-1234-5678 / Email: sales@dmm.co.jp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-0 space-y-3">
                <div className="flex items-center gap-2 p-4 bg-white rounded-lg border border-slate-200 text-green-600">
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">メール文面生成完了</span>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg p-4">
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">送付メール文面</Label>
                  <Textarea value={projectData.emailDraft || ""} onChange={(e) => onEmailDraftChange(e.target.value)} rows={16} className="font-mono text-sm" />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
