import type { DesignRequest } from "@/types/lottery"

/**
 * DesignRequestsのテストデータ
 *
 * 画面間データ整合性:
 * - dr-1: 営業 → デザイン業者、poster、projectId=25（秋の合同大抽選会）、requested
 * - dr-2: 営業 → デザイン業者、dm、projectId=26（年末ジャンボ抽選会）、uploaded
 * - dr-3: 営業 → デザイン業者、poster、projectId=26（年末ジャンボ抽選会）、uploaded
 * - dr-4: 事務管理課 → デザイン業者、winner-list、projectId=26（年末ジャンボ抽選会）、requested
 * - dr-5: 営業 → デザイン業者、poster、projectId=27（新春特別抽選会）、uploaded
 * - dr-6: 営業 → デザイン業者、dm、projectId=27（新春特別抽選会）、uploaded
 * - dr-7: 事務管理課 → デザイン業者、winner-list、projectId=27（新春特別抽選会）、uploaded
 * - dr-8: 営業 → デザイン業者、poster、projectId=28（冬の大感謝祭）、uploaded
 * - dr-9: 事務管理課 → デザイン業者、winner-list、projectId=28（冬の大感謝祭）、uploaded
 */
export const comprehensiveDesignRequests: DesignRequest[] = [
  // dr-1: 営業 → デザイン業者、poster、projectId=25、requested
  {
    id: "dr-1",
    requestType: "poster",
    projectId: 25,
    projectName: "秋の合同大抽選会",
    companyName: "株式会社サンライズ",
    hallNames: ["サンライズ錦糸町店", "サンライズ新橋店"],
    eventStartDate: "2026/09/20",
    eventEndDate: "2026/09/26",
    requestedAt: "2026-02-26T10:00:00Z",
    requestedBy: "17",
    requestedByName: "森 十七",
    status: "requested",
    vendorId: "1",
    vendorName: "デザインスタジオABC",
    comments: [
      {
        id: "c1-1",
        role: "Sales",
        authorId: "17",
        authorName: "森 十七",
        text: "秋らしいデザインでお願いします。紅葉をモチーフにしたイメージで。",
        createdAt: "2026-02-26T10:30:00Z",
      },
    ],
    prizeInfo: [
      { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "2" },
      { rank: "A賞", name: "ノートパソコン", quantity: "8" },
      { rank: "B賞", name: "高級炊飯器", quantity: "15" },
      { rank: "C賞", name: "クオカード 5000円分", quantity: "100" },
    ],
  },

  // dr-2: 営業 → デザイン業者、dm、projectId=26、uploaded
  {
    id: "dr-2",
    requestType: "dm",
    projectId: 26,
    projectName: "年末ジャンボ抽選会",
    companyName: "株式会社ビッグエース",
    hallNames: ["ビッグエース新橋店", "ビッグエース横浜店", "ビッグエース川崎店"],
    eventStartDate: "2026/12/20",
    eventEndDate: "2026/12/26",
    requestedAt: "2026-03-02T14:00:00Z",
    requestedBy: "18",
    requestedByName: "池田 十八",
    status: "uploaded",
    vendorId: "2",
    vendorName: "クリエイティブワークス",
    uploadedFileName: "dm_yearend_jumbo_v2.pdf",
    uploadedAt: "2026-03-05T16:30:00Z",
    comments: [
      {
        id: "c2-1",
        role: "Sales",
        authorId: "18",
        authorName: "池田 十八",
        text: "年末らしい華やかなデザインでお願いします。",
        createdAt: "2026-03-02T14:30:00Z",
      },
      {
        id: "c2-2",
        role: "DesignVendor",
        authorName: "クリエイティブワークス",
        text: "初稿をアップロードしました。ご確認ください。",
        createdAt: "2026-03-05T16:35:00Z",
      },
      {
        id: "c2-3",
        role: "Sales",
        authorId: "18",
        authorName: "池田 十八",
        text: "確認しました。問題ありません。このまま進めてください。",
        createdAt: "2026-03-06T10:00:00Z",
      },
    ],
    prizeInfo: [
      { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "3" },
      { rank: "A賞", name: "ノートパソコン", quantity: "10" },
      { rank: "B賞", name: "掃除機ロボット", quantity: "20" },
      { rank: "C賞", name: "クオカード 10000円分", quantity: "50" },
      { rank: "D賞", name: "クオカード 5000円分", quantity: "200" },
    ],
  },

  // dr-3: 営業 → デザイン業者、poster、projectId=26、uploaded
  {
    id: "dr-3",
    requestType: "poster",
    projectId: 26,
    projectName: "年末ジャンボ抽選会",
    companyName: "株式会社ビッグエース",
    hallNames: ["ビッグエース新橋店", "ビッグエース横浜店", "ビッグエース川崎店"],
    eventStartDate: "2026/12/20",
    eventEndDate: "2026/12/26",
    requestedAt: "2026-03-02T11:00:00Z",
    requestedBy: "18",
    requestedByName: "池田 十八",
    status: "uploaded",
    vendorId: "3",
    vendorName: "プリントエキスパート",
    uploadedFileName: "poster_yearend_jumbo_final.pdf",
    uploadedAt: "2026-03-06T14:00:00Z",
    comments: [
      {
        id: "c3-1",
        role: "Sales",
        authorId: "18",
        authorName: "池田 十八",
        text: "A1サイズでお願いします。豪華な景品を全面に出したデザインで。",
        createdAt: "2026-03-02T11:30:00Z",
      },
      {
        id: "c3-2",
        role: "DesignVendor",
        authorName: "プリントエキスパート",
        text: "初稿をアップロードしました。",
        createdAt: "2026-03-06T14:05:00Z",
      },
    ],
    prizeInfo: [
      { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "3" },
      { rank: "A賞", name: "ノートパソコン", quantity: "10" },
      { rank: "B賞", name: "掃除機ロボット", quantity: "20" },
      { rank: "C賞", name: "クオカード 10000円分", quantity: "50" },
      { rank: "D賞", name: "クオカード 5000円分", quantity: "200" },
    ],
  },

  // dr-4: 事務管理課 → デザイン業者、winner-list、projectId=26、requested
  {
    id: "dr-4",
    requestType: "winner-list",
    projectId: 26,
    projectName: "年末ジャンボ抽選会",
    companyName: "株式会社ビッグエース",
    hallNames: ["ビッグエース新橋店", "ビッグエース横浜店", "ビッグエース川崎店"],
    eventStartDate: "2026/12/20",
    eventEndDate: "2026/12/26",
    requestedAt: "2026-03-10T09:00:00Z",
    requestedBy: "admin",
    requestedByName: "事務管理課",
    status: "requested",
    vendorId: "2",
    vendorName: "クリエイティブワークス",
    comments: [
      {
        id: "c4-1",
        role: "Sales",
        authorId: "admin",
        authorName: "事務管理課",
        text: "当選者リストをもとに当選通知書を作成してください。",
        createdAt: "2026-03-10T09:15:00Z",
      },
    ],
  },

  // dr-5: 営業 → デザイン業者、poster、projectId=27、uploaded
  {
    id: "dr-5",
    requestType: "poster",
    projectId: 27,
    projectName: "新春特別抽選会",
    companyName: "株式会社パチンコランド",
    hallNames: ["パチンコランド横浜店", "パチンコランド川崎店"],
    eventStartDate: "2026/01/10",
    eventEndDate: "2026/01/16",
    requestedAt: "2025-12-05T10:00:00Z",
    requestedBy: "19",
    requestedByName: "橋本 十九",
    status: "uploaded",
    vendorId: "1",
    vendorName: "デザインスタジオABC",
    uploadedFileName: "poster_newyear_2026.pdf",
    uploadedAt: "2025-12-10T15:00:00Z",
    comments: [],
    prizeInfo: [
      { rank: "特賞", name: "電動自転車", quantity: "2" },
      { rank: "A賞", name: "高級炊飯器", quantity: "10" },
      { rank: "B賞", name: "コーヒーメーカー", quantity: "30" },
      { rank: "C賞", name: "クオカード 5000円分", quantity: "100" },
    ],
  },

  // dr-6: 営業 → デザイン業者、dm、projectId=27、uploaded
  {
    id: "dr-6",
    requestType: "dm",
    projectId: 27,
    projectName: "新春特別抽選会",
    companyName: "株式会社パチンコランド",
    hallNames: ["パチンコランド横浜店", "パチンコランド川崎店"],
    eventStartDate: "2026/01/10",
    eventEndDate: "2026/01/16",
    requestedAt: "2025-12-05T11:00:00Z",
    requestedBy: "19",
    requestedByName: "橋本 十九",
    status: "uploaded",
    vendorId: "2",
    vendorName: "クリエイティブワークス",
    uploadedFileName: "dm_newyear_2026_final.pdf",
    uploadedAt: "2025-12-12T14:00:00Z",
    comments: [
      {
        id: "c6-1",
        role: "DesignVendor",
        authorName: "クリエイティブワークス",
        text: "新春らしい紅白のデザインでまとめました。",
        createdAt: "2025-12-12T14:10:00Z",
      },
    ],
    prizeInfo: [
      { rank: "特賞", name: "電動自転車", quantity: "2" },
      { rank: "A賞", name: "高級炊飯器", quantity: "10" },
      { rank: "B賞", name: "コーヒーメーカー", quantity: "30" },
      { rank: "C賞", name: "クオカード 5000円分", quantity: "100" },
    ],
  },

  // dr-7: 事務管理課 → デザイン業者、winner-list、projectId=27、uploaded
  {
    id: "dr-7",
    requestType: "winner-list",
    projectId: 27,
    projectName: "新春特別抽選会",
    companyName: "株式会社パチンコランド",
    hallNames: ["パチンコランド横浜店", "パチンコランド川崎店"],
    eventStartDate: "2026/01/10",
    eventEndDate: "2026/01/16",
    requestedAt: "2026-01-11T10:00:00Z",
    requestedBy: "admin",
    requestedByName: "事務管理課",
    status: "uploaded",
    vendorId: "1",
    vendorName: "デザインスタジオABC",
    uploadedFileName: "winner_list_newyear_2026.xlsx",
    uploadedAt: "2026-01-12T11:00:00Z",
    comments: [
      {
        id: "c7-1",
        role: "DesignVendor",
        authorName: "デザインスタジオABC",
        text: "当選通知書をアップロードしました。ご確認ください。",
        createdAt: "2026-01-12T11:05:00Z",
      },
    ],
  },

  // dr-8: 営業 → デザイン業者、poster、projectId=28、uploaded
  {
    id: "dr-8",
    requestType: "poster",
    projectId: 28,
    projectName: "冬の大感謝祭（終了）",
    companyName: "株式会社エースパチンコ",
    hallNames: ["エースパチンコ川崎店"],
    eventStartDate: "2025/12/15",
    eventEndDate: "2025/12/21",
    requestedAt: "2025-11-10T10:00:00Z",
    requestedBy: "20",
    requestedByName: "石川 二十",
    status: "uploaded",
    vendorId: "3",
    vendorName: "プリントエキスパート",
    uploadedFileName: "poster_winter_thanks_2025.pdf",
    uploadedAt: "2025-11-18T14:00:00Z",
    comments: [],
    prizeInfo: [
      { rank: "A賞", name: "掃除機ロボット", quantity: "5" },
      { rank: "B賞", name: "コーヒーメーカー", quantity: "15" },
      { rank: "C賞", name: "クオカード 5000円分", quantity: "80" },
    ],
  },

  // dr-9: 事務管理課 → デザイン業者、winner-list、projectId=28、uploaded
  {
    id: "dr-9",
    requestType: "winner-list",
    projectId: 28,
    projectName: "冬の大感謝祭（終了）",
    companyName: "株式会社エースパチンコ",
    hallNames: ["エースパチンコ川崎店"],
    eventStartDate: "2025/12/15",
    eventEndDate: "2025/12/21",
    requestedAt: "2025-12-17T10:00:00Z",
    requestedBy: "admin",
    requestedByName: "事務管理課",
    status: "uploaded",
    vendorId: "2",
    vendorName: "クリエイティブワークス",
    uploadedFileName: "winner_list_winter_thanks_2025.xlsx",
    uploadedAt: "2025-12-18T11:00:00Z",
    comments: [],
  },
]
