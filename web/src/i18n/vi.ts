export const vi = {
  // Navigation
  nav: {
    predictions: 'Dự đoán',
    allMatches: 'Lịch đấu',
    leaderboard: 'Bảng xếp hạng',
    leagues: 'Giải đấu',
    rules: 'Luật chơi',
    bracket: 'Sơ đồ',
    about: 'Giới thiệu',
    editProfile: 'Sửa hồ sơ',
    signOut: 'Đăng xuất',
    signIn: 'Đăng nhập',
    signInGoogle: 'Đăng nhập bằng Google',
    myLeagues: 'Giải của tôi',
  },

  // Home
  home: {
    title: 'Lịch thi đấu',
    loading: 'Đang tải...',
    error: 'Lỗi',
    byDay: 'Theo ngày',
    byGroup: 'Theo bảng',
  },

  // Match
  match: {
    group: 'Bảng',
    round: 'Vòng',
    live: 'TRỰC TIẾP',
    pts: 'đ',
    stadium: 'Sân',
    upcoming: 'Sắp diễn ra',
    matches: 'trận',
    closed: 'Đã đóng',
    predictBefore: 'Dự đoán trước',
    liveMatches: 'Đang diễn ra',
    recentResults: 'Kết quả gần đây',
    tabLive: 'Đang diễn ra',
    tabUpcoming: 'Chưa diễn ra',
    tabFinished: 'Đã kết thúc',
    noLive: 'Hiện không có trận nào đang diễn ra',
    noUpcoming: 'Không có trận nào sắp diễn ra',
    noFinished: 'Chưa có trận nào kết thúc',
  },

  // Bracket
  bracket: {
    title: 'Sơ đồ nhánh',
    subtitle: 'Chạm vào trận đã có đội để dự đoán tỉ số, đội đi tiếp và đặt ngôi sao hi vọng.',
    subtitleGuest: 'Vòng loại trực tiếp World Cup 2026. Đăng nhập để dự đoán.',
    final: 'CHUNG KẾT',
    thirdPlace: 'Tranh hạng 3',
    save: 'Lưu dự đoán',
  },

  // Matches Header
  matchesHeader: {
    groupStage: 'Vòng bảng',
    knockoutStage: 'Vòng loại trực tiếp',
  },

  // Leaderboard
  leaderboard: {
    title: 'Bảng xếp hạng',
    loading: 'Đang tải...',
    noPlayers: 'Chưa có người chơi',
    score: 'Điểm',
    rank: 'Hạng',
  },

  // Rules
  rules: {
    title: 'Luật chơi',
    tabGroup: 'Vòng bảng',
    tabKnockout: 'Vòng knockout',
    predictionDeadline: 'Hạn chót dự đoán',
    deadlineDesc: 'Dự đoán phải được gửi trước ít nhất',
    deadlineTime: '10 phút trước giờ bóng lăn',
    deadlineAfter: '. Sau thời điểm này, dự đoán sẽ bị khóa và không thể thay đổi.',
    howPointsWork: 'Điểm cơ bản mỗi trận',
    exactScore: 'Đúng tỉ số — 15 điểm',
    exactScoreDesc: 'Dự đoán đúng tỉ số cuối cùng của cả hai đội.',
    correctResult: 'Đúng kết quả — Tối đa 10 điểm',
    correctResultDesc: 'Dự đoán đúng đội thắng (hoặc hòa), nhưng không đúng tỉ số. Điểm = 10 trừ đi tổng chênh lệch tỉ số.',
    wrongResult: 'Sai kết quả — 0 điểm',
    wrongResultDesc: 'Dự đoán sai đội thắng hoặc bỏ lỡ kết quả hòa.',
    examples: 'Ví dụ',
    actualResult: 'Kết quả thực tế',
    yourPrediction: 'Dự đoán của bạn',
    pointsEarned: 'Điểm nhận được',
    exact: 'Đúng!',
    wrongWinner: 'Sai đội thắng',

    // Knockout — đội đi tiếp
    knockoutTitle: 'Vòng loại trực tiếp',
    knockoutIntro:
      'Ở vòng loại trực tiếp luôn có đội đi tiếp. Tỉ số tính theo kết quả sau hiệp phụ (không tính luân lưu), cộng thêm điểm thưởng cho việc đoán đúng đội đi tiếp.',
    koScoreTitle: 'Điểm tỉ số (giống vòng bảng)',
    koExactScore: 'Đúng tỉ số — 15 điểm',
    koExactScoreDesc: 'Dự đoán đúng tỉ số cuối cùng của cả hai đội (sau hiệp phụ).',
    advanceBonus: 'Đúng đội đi tiếp — +5 điểm',
    advanceBonusDesc:
      'Cộng thêm 5 điểm nếu đội bạn chọn đi tiếp đúng là đội vào vòng trong (tính cả kết quả luân lưu). Khi dự một tỉ số hòa, bạn chọn thêm đội thắng luân lưu; khi dự một đội thắng, đội đó mặc định là đội đi tiếp.',
    knockoutNote:
      'Loạt luân lưu chỉ ảnh hưởng đến điểm "đội đi tiếp", không ảnh hưởng đến điểm tỉ số. Đoán một trận hòa nghĩa là đoán trận đó sẽ đi tới luân lưu.',

    // Hệ số mỗi vòng
    multiplierTitle: 'Hệ số mỗi vòng',
    multiplierDesc:
      'Càng vào sâu, mỗi trận càng giá trị. Điểm cơ bản của trận (gồm cả điểm đội đi tiếp) được nhân với hệ số của vòng đấu.',
    multipliers: [
      { round: 'Vòng bảng', value: '×1' },
      { round: 'Vòng 1/32', value: '×1' },
      { round: 'Vòng 1/16', value: '×2' },
      { round: 'Tứ kết', value: '×3' },
      { round: 'Bán kết', value: '×4' },
      { round: 'Tranh hạng 3', value: '×3' },
      { round: 'Chung kết', value: '×5' },
    ],

    // Ngôi sao hi vọng
    starTitle: 'Ngôi sao hi vọng',
    starDesc:
      'Mỗi vòng đấu, bạn được đặt 1 "Ngôi sao hi vọng" lên một trận — đặt cược vào đội bạn chọn đi tiếp. Đội đó vào vòng trong thì nhân đôi điểm, bị loại thì bị trừ điểm.',
    starRules: [
      'Mỗi vòng đấu chỉ được đặt 1 Ngôi sao hi vọng.',
      'Ngôi sao gắn với đội bạn chọn đi tiếp (tính cả kết quả luân lưu).',
      'Đúng đội đi tiếp: toàn bộ điểm trận được nhân đôi.',
      'Sai đội đi tiếp: bị trừ 10 × hệ số vòng.',
      'Phải đặt trước khi trận bị khóa; sau khi khóa không thể đổi.',
      'Phạt nhân theo hệ số vòng — vòng càng sâu thưởng càng lớn thì rủi ro cũng càng lớn.',
    ],

    // Công thức tổng
    formulaTitle: 'Công thức tính điểm',
    formula: '(Điểm tỉ số + Điểm đội đi tiếp) × Hệ số vòng — rồi ×2 nếu Ngôi sao đúng đội đi tiếp, hoặc −10 × Hệ số vòng nếu sai.',

    // Ví dụ knockout
    knockoutExampleTitle: 'Ví dụ vòng loại trực tiếp',
    roundLabel: 'Vòng',
    advancePickLabel: 'Đội đi tiếp bạn chọn',
    multiplierLabel: 'Hệ số vòng',
    starLabel: 'Ngôi sao hi vọng',
    totalLabel: 'Tổng điểm',
  },

  // Leagues
  leagues: {
    title: 'Giải đấu',
    join: 'Tham gia',
    create: 'Tạo mới',
    joinLeague: 'Tham gia giải',
    inviteCode: 'Nhập mã mời',
    cancel: 'Hủy',
    joining: 'Đang tham gia...',
    globalLeaderboard: 'Bảng xếp hạng chung',
    noLeagues: 'Bạn chưa tham gia giải nào',
    noLeaguesDesc: 'Tạo giải đấu riêng hoặc tham gia bằng mã mời',
    members: 'thành viên',
    member: 'thành viên',
    signInToJoin: 'Đăng nhập để tạo hoặc tham gia giải đấu',
    invalidCode: 'Mã mời không hợp lệ',
    failedJoin: 'Tham gia thất bại',
  },

  // Profile
  profile: {
    loading: 'Đang tải...',
    predictions: 'Dự đoán',
  },

  // User Menu
  userMenu: {
    score: 'Điểm',
    rank: 'Hạng',
  },

  // Common
  common: {
    loading: 'Đang tải...',
    error: 'Lỗi',
  },
};

export type Translations = typeof vi;
