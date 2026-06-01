export const vi = {
  // Navigation
  nav: {
    predictions: 'Dự đoán',
    allMatches: 'Lịch đấu',
    leaderboard: 'Bảng xếp hạng',
    leagues: 'Giải đấu',
    rules: 'Luật chơi',
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
    predictionDeadline: 'Hạn chót dự đoán',
    deadlineDesc: 'Dự đoán phải được gửi trước ít nhất',
    deadlineTime: '10 phút trước giờ bóng lăn',
    deadlineAfter: '. Sau thời điểm này, dự đoán sẽ bị khóa và không thể thay đổi.',
    howPointsWork: 'Cách tính điểm',
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
