import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Calendar, Award, User, Bell, Search, MapPin, Clock, Users, 
  CheckCircle, ChevronRight, Download, Sparkles, Volume2, VolumeX, 
  ShieldCheck, ArrowRight, Share2, Compass, Flame, Info, Check, X
} from 'lucide-react';

// --- WEB AUDIO API CHO ÂM THANH CHUÔNG CHÙA & MÕ ---
const playTempleSound = (type = 'bell') => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'bell') {
      // Âm thanh chuông chùa ngân vang (tần số chuông đồng)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 2.5);
      
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.8);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.8);
    } else {
      // Âm thanh mõ gỗ trầm ấm
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }
  } catch (e) {
    console.log("Audio not supported or blocked", e);
  }
};

// --- DỮ LIỆU MẪU CÁC PHẬT SỰ & CÔNG QUẢ ---
const INITIAL_TASKS = [
  {
    id: 1,
    title: "Hậu Cẩn & Sửa soạn Trai Tăng Đại Lễ Vu Lan",
    temple: "Chùa Vĩnh Nghiêm",
    address: "339 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM",
    date: "15/07/2026",
    time: "07:00 - 13:00",
    category: "Nhà bếp & Trai soạn",
    slotsTotal: 25,
    slotsRegistered: 18,
    points: 15,
    description: "Chuẩn bị nguyên liệu, sơ chế thức ăn chay và bày biện mâm cúng dường tri ân mùa Vu Lan báo hiếu.",
    requirements: "Sức khỏe tốt, trang phục nghiêm trang (áo lam/tràng), có mặt đúng giờ.",
    accommodation: false
  },
  {
    id: 2,
    title: "Trợ giúp Khóa tu Thiền định & Chánh niệm Cuối Tuần",
    temple: "Thiền Viện Trúc Lâm Sài Gòn",
    address: "Huyện Củ Chi, TP.HCM",
    date: "20/07/2026",
    time: "06:00 - 17:00",
    category: "Hậu cần & Hướng dẫn",
    slotsTotal: 15,
    slotsRegistered: 12,
    points: 20,
    description: "Đón tiếp thiền sinh, sắp xếp chỗ ngồi thiền đường, hướng dẫn trật tự bãi xe và hỗ trợ Ban thư ký.",
    requirements: "Cẩn thận, nhiệt tình, ưu tiên người có kinh nghiệm sinh hoạt Phật pháp.",
    accommodation: true
  },
  {
    id: 3,
    title: "Vệ sinh, Lau chánh điện & Chăm sóc Cảnh quan Tự Viện",
    temple: "Chùa Pháp Hoa",
    address: "870/37 Trường Sa, Q. Phú Nhuận, TP.HCM",
    date: "25/07/2026",
    time: "08:00 - 11:30",
    category: "Vệ sinh & Cảnh quan",
    slotsTotal: 10,
    slotsRegistered: 4,
    points: 10,
    description: "Lau chùi các án thờ, bày biện hoa tươi dâng Phật, cắt tỉa cây cảnh và quét dọn khuôn viên chùa.",
    requirements: "Không yêu cầu kinh nghiệm, tâm thành kính, hoan hỷ.",
    accommodation: false
  },
  {
    id: 4,
    title: "Ghi hình & Hỗ trợ Truyền thông Đại Lễ Phật Đản",
    temple: "Chùa Hoằng Pháp",
    address: "Hóc Môn, TP.HCM",
    date: "02/08/2026",
    time: "13:00 - 20:30",
    category: "Truyền thông & Kỹ thuật",
    slotsTotal: 8,
    slotsRegistered: 7,
    points: 25,
    description: "Chụp ảnh lưu niệm, quay phim sự kiện thuyết pháp và hỗ trợ trực tuyến phát sóng buổi lễ.",
    requirements: "Có máy ảnh/smartphone quay chụp tốt, biết dựng video cơ bản là lợi thế.",
    accommodation: false
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [registeredTasks, setRegisteredTasks] = useState([INITIAL_TASKS[0]]);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRTask, setCurrentQRTask] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Thông tin Phật tử cá nhân
  const [profile, setProfile] = useState({
    name: 'Nguyễn Lý Thủy Tiên',
    dharmaName: 'Diệu Tâm',
    phone: '0903 123 456',
    email: 'thuytien@phungsu.vn',
    skills: ['Nấu ăn chay', 'Hậu cần sự kiện', 'Truyền thông'],
    totalHours: 48,
    totalMeritPoints: 125,
    level: 'Bồ Đề Tinh Tấn'
  });

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRegisterTask = (task) => {
    if (soundEnabled) playTempleSound('bell');
    if (registeredTasks.some(t => t.id === task.id)) {
      showNotification('Bạn đã đăng ký Phật sự này rồi!');
      return;
    }
    setRegisteredTasks([...registeredTasks, task]);
    setTasks(tasks.map(t => t.id === task.id ? { ...t, slotsRegistered: t.slotsRegistered + 1 } : t));
    setActiveTaskModal(null);
    showNotification('Nam Mô Bổn Sư Thích Ca Mâu Ni! Đăng ký công quả thành công.');
  };

  const handleCancelRegistration = (taskId) => {
    if (soundEnabled) playTempleSound('mora');
    setRegisteredTasks(registeredTasks.filter(t => t.id !== taskId));
    setTasks(tasks.map(t => t.id === taskId ? { ...t, slotsRegistered: Math.max(0, t.slotsRegistered - 1) } : t));
    showNotification('Đã hủy đăng ký ca công quả.');
  };

  const categories = ['Tất cả', 'Nhà bếp & Trai soạn', 'Hậu cần & Hướng dẫn', 'Vệ sinh & Cảnh quan', 'Truyền thông & Kỹ thuật'];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.temple.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#140E0A] text-[#EFE6DA] font-['Be_Vietnam_Pro',sans-serif] selection:bg-[#D4AF37] selection:text-[#140E0A] relative overflow-x-hidden pb-24">
      
      {/* BACKGROUND PHẬT GIÁO TĨNH TỊNH (Họa tiết hoa sen & Hào quang) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D4AF37]/20 via-[#B8860B]/10 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-[#E25822]/15 via-[#D4AF37]/10 to-transparent blur-[140px]"></div>
        
        {/* Họa tiết mây ngũ sắc & tâm linh mờ */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>
      </div>

      {/* HEADER THANH TỊNH */}
      <header className="relative z-20 border-b border-[#3D2C1E] bg-[#1C120C]/90 backdrop-blur-md sticky top-0 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#996515] flex items-center justify-center shadow-md shadow-[#D4AF37]/20 border border-[#FFE58F]">
              <Flame className="w-5 h-5 text-[#140E0A]" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display',serif] text-lg font-bold text-[#F3E5AB] tracking-wide">PHỤNG SỰ SỐ</h1>
              <p className="text-xs text-[#C8B6A6]">Nhật ký công quả & Phật sự online</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if(!soundEnabled) playTempleSound('bell');
              }}
              className="p-2 rounded-full bg-[#2A1D15] border border-[#4E3928] text-[#D4AF37] hover:bg-[#3D2C1E] transition"
              title={soundEnabled ? "Tắt âm thanh chuông" : "Bật âm thanh chuông"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>

            <div className="hidden sm:flex items-center space-x-2 bg-[#2A1D15] px-3 py-1.5 rounded-full border border-[#4E3928]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-xs text-[#F3E5AB] font-medium">{profile.totalMeritPoints} Điểm Công Đức</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-[#3D2C1E] border border-[#D4AF37]/40 flex items-center justify-center text-sm font-bold text-[#F3E5AB]">
              {profile.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-[#2A1D15] border border-[#D4AF37] text-[#F3E5AB] px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        
        {/* TAB 1: TRANG CHỦ & DANH SÁCH PHẬT SỰ */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Banner Chào Mừng & Lời Phật Dạy */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#2A1D15] via-[#35251B] to-[#2A1D15] border border-[#5A422D] p-6 shadow-xl overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold bg-[#1C120C]/60 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  Phụng sự chúng sinh là cúng dường chư Phật
                </span>
                <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#F3E5AB] mt-3 mb-2">
                  Nam Mô Bổn Sư Thích Ca Mâu Ni
                </h2>
                <p className="text-sm text-[#D1C3B2] max-w-xl leading-relaxed">
                  "Bố thí lòng từ, cúng dường công quả. Hãy chọn tự viện gần nhất và đăng ký ca phụng sự để gieo trồng phước điền cho tự thân và gia quyến."
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#140E0A] font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-[#D4AF37]/20 hover:opacity-90 transition flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Lịch công quả của tôi ({registeredTasks.length})</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('passport')}
                    className="bg-[#1C120C] text-[#F3E5AB] border border-[#5A422D] font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-[#3D2C1E] transition flex items-center space-x-2"
                  >
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>Sổ tay & Giấy chứng nhận</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Thanh Tìm Kiếm & Lọc Danh Mục */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Tìm tên Phật sự, tên Chùa hoặc địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1C120C] border border-[#3D2C1E] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-3 text-sm text-[#EFE6DA] placeholder-gray-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Danh mục Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                      selectedCategory === cat 
                        ? 'bg-[#D4AF37] text-[#140E0A] border-[#FFE58F] shadow-md shadow-[#D4AF37]/20' 
                        : 'bg-[#1C120C] text-[#C8B6A6] border-[#3D2C1E] hover:border-[#5A422D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh Sách Công Quả Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-[#1C120C] rounded-2xl border border-[#3D2C1E]">
                  <Compass className="w-10 h-10 text-[#D4AF37] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-gray-400">Không tìm thấy Phật sự phù hợp với tìm kiếm của bạn.</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isRegistered = registeredTasks.some(t => t.id === task.id);
                  const isFull = task.slotsRegistered >= task.slotsTotal;

                  return (
                    <div 
                      key={task.id}
                      className="bg-[#1C120C] border border-[#3D2C1E] hover:border-[#D4AF37]/50 rounded-2xl p-5 flex flex-col justify-between transition shadow-md group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent pointer-events-none rounded-bl-full"></div>

                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-[11px] bg-[#2A1D15] text-[#D4AF37] border border-[#4E3928] px-2.5 py-1 rounded-full font-medium">
                            {task.category}
                          </span>
                          <span className="text-xs text-[#E25822] font-semibold bg-[#2A1D15] px-2 py-0.5 rounded border border-[#E25822]/30">
                            +{task.points} Điểm Phước
                          </span>
                        </div>

                        <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#F3E5AB] group-hover:text-[#FFE58F] transition mb-2">
                          {task.title}
                        </h3>

                        <div className="space-y-1.5 text-xs text-[#C8B6A6] mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="font-medium text-[#EFE6DA]">{task.temple}</span>
                          </div>
                          <p className="text-gray-400 pl-5 truncate">{task.address}</p>
                          <div className="flex items-center space-x-4 pt-1">
                            <span className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{task.date}</span>
                            </span>
                            <span className="flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{task.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#3D2C1E] flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                          <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Đã đăng ký: <strong className="text-[#F3E5AB]">{task.slotsRegistered}/{task.slotsTotal}</strong></span>
                        </div>

                        <button
                          onClick={() => {
                            if(soundEnabled) playTempleSound('mora');
                            setActiveTaskModal(task);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1 ${
                            isRegistered 
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50' 
                              : isFull 
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-[#D4AF37] text-[#140E0A] hover:bg-[#C59B27]'
                          }`}
                        >
                          {isRegistered ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã đăng ký</span>
                            </>
                          ) : isFull ? (
                            <span>Đã đủ người</span>
                          ) : (
                            <>
                              <span>Chi tiết & Đăng ký</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LỊCH TRÌNH & ĐIỂM DANH QR */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-[#1C120C] border border-[#3D2C1E] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#F3E5AB]">Lịch Công Quả Của Tôi</h2>
                  <p className="text-xs text-[#C8B6A6] mt-1">Các ca Phật sự bạn đã đăng ký tham gia phụng sự.</p>
                </div>
                <span className="bg-[#2A1D15] text-[#D4AF37] border border-[#4E3928] px-3 py-1 rounded-full text-xs font-semibold">
                  {registeredTasks.length} Ca đã nhận
                </span>
              </div>

              {registeredTasks.length === 0 ? (
                <div className="py-16 text-center">
                  <Calendar className="w-12 h-12 text-[#D4AF37] mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-gray-400 mb-4">Bạn chưa đăng ký ca công quả nào.</p>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="bg-[#D4AF37] text-[#140E0A] font-semibold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Khám phá danh sách Phật sự ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {registeredTasks.map((task) => (
                    <div key={task.id} className="bg-[#2A1D15] border border-[#4E3928] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-[#1C120C] text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                            {task.date} ({task.time})
                          </span>
                          <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
                            Đã xác nhận
                          </span>
                        </div>
                        <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#F3E5AB]">
                          {task.title}
                        </h3>
                        <p className="text-xs text-gray-300 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{task.temple} — {task.address}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#3D2C1E]">
                        <button
                          onClick={() => {
                            if(soundEnabled) playTempleSound('bell');
                            setCurrentQRTask(task);
                            setShowQRModal(true);
                          }}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#140E0A] font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Mã QR Điểm Danh</span>
                        </button>
                        <button
                          onClick={() => handleCancelRegistration(task.id)}
                          className="p-2 bg-[#1C120C] text-red-400 border border-red-900/40 hover:bg-red-950/30 rounded-xl text-xs transition"
                          title="Hủy đăng ký"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SỔ TAY & GIẤY CHỨNG NHẬN */}
        {activeTab === 'passport' && (
          <div className="space-y-6">
            
            {/* Thống kê Tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1C120C] border border-[#3D2C1E] rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-[#2A1D15] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3 text-[#D4AF37]">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-bold font-['Playfair_Display',serif] text-[#F3E5AB]">{profile.totalHours} Giờ</h4>
                <p className="text-xs text-[#C8B6A6] mt-1">Tổng thời gian phụng sự</p>
              </div>

              <div className="bg-[#1C120C] border border-[#3D2C1E] rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-[#2A1D15] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3 text-[#D4AF37]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-bold font-['Playfair_Display',serif] text-[#F3E5AB]">{profile.totalMeritPoints} Điểm</h4>
                <p className="text-xs text-[#C8B6A6] mt-1">Điểm Phước Đức tích lũy</p>
              </div>

              <div className="bg-[#1C120C] border border-[#3D2C1E] rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-[#2A1D15] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3 text-[#D4AF37]">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold font-['Playfair_Display',serif] text-[#F3E5AB]">{profile.level}</h4>
                <p className="text-xs text-[#C8B6A6] mt-1">Huy hiệu Tinh Tấn</p>
              </div>
            </div>

            {/* MẪU GIẤY CHỨNG NHẬN CÔNG ĐỨC (DIGITAL CERTIFICATE) */}
            <div className="bg-gradient-to-b from-[#1F140D] to-[#140E0A] border-2 border-[#D4AF37]/60 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              
              {/* Viền hoa văn truyền thống góc */}
              <div className="absolute top-3 left-3 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/40 pointer-events-none"></div>
              <div className="absolute top-3 right-3 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]/40 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]/40 pointer-events-none"></div>
              <div className="absolute bottom-3 right-3 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/40 pointer-events-none"></div>

              <div className="text-center space-y-3 max-w-xl mx-auto">
                <p className="text-xs tracking-[0.25em] uppercase text-[#D4AF37] font-bold">GIÁO HỘI PHẬT GIÁO VIỆT NAM</p>
                <h3 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#F3E5AB]">
                  GIẤY CHỨNG NHẬN PHÙNG SỰ & CÔNG ĐỨC
                </h3>
                <p className="text-xs text-[#C8B6A6] italic">Trân trọng ghi nhận công đức tinh tấn của Phật tử:</p>
                
                <div className="py-2">
                  <h4 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#FFE58F] underline decoration-[#D4AF37]/50 underline-offset-8">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-[#D4AF37] mt-1">Pháp danh: {profile.dharmaName}</p>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed pt-2">
                  Đã hoàn thành xuất sắc các Phật sự và công tác thiện nguyện, phụng sự chư Tăng Ni và tự viện với tổng thời gian <strong>{profile.totalHours} giờ</strong> trong năm 2026. Gieo trồng cội phước điền viên mãn.
                </p>

                {/* Dấu Mộc Đỏ & Chữ Ký */}
                <div className="pt-8 flex items-center justify-between px-6">
                  <div className="text-left">
                    <p className="text-[11px] text-gray-400">TP. Hồ Chí Minh, ngày 02 tháng 11 năm 2026</p>
                    <p className="text-xs font-bold text-[#F3E5AB] mt-1">BAN HẬU CẦN TỰ VIỆN</p>
                  </div>
                  
                  {/* Mộc Triện Đỏ Giả Lập */}
                  <div className="w-20 h-20 rounded-full border-2 border-red-600/70 flex flex-col items-center justify-center p-1 transform rotate-[-12deg] bg-red-950/20 shadow-inner">
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Ban Phụng Sự</span>
                    <span className="text-[10px] font-bold text-red-400">ẤN CÔNG ĐỨC</span>
                    <span className="text-[8px] text-red-500">★ PHẬT SỰ ★</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => {
                      if(soundEnabled) playTempleSound('bell');
                      showNotification('Đã tải xuống Giấy chứng nhận công đức (PDF/Image).');
                    }}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#140E0A] font-bold px-6 py-3 rounded-xl text-xs shadow-lg hover:opacity-90 transition inline-flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Giấy Chứng Nhận Điện Tử</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HỒ SƠ PHẬT TỬ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#1C120C] border border-[#3D2C1E] rounded-2xl p-6 max-w-xl mx-auto">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-[#3D2C1E]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#996515] flex items-center justify-center text-xl font-bold text-[#140E0A] shadow-lg">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#F3E5AB]">{profile.name}</h3>
                  <p className="text-xs text-[#D4AF37]">Pháp danh: {profile.dharmaName}</p>
                  <p className="text-xs text-gray-400 mt-1">Thành viên từ: Tháng 12/2025</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Số điện thoại liên hệ</label>
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full bg-[#2A1D15] border border-[#3D2C1E] rounded-xl px-4 py-2.5 text-[#EFE6DA] outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Email Phật tử</label>
                  <input 
                    type="text" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-[#2A1D15] border border-[#3D2C1E] rounded-xl px-4 py-2.5 text-[#EFE6DA] outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-2">Kỹ năng & Sở trường công quả</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="bg-[#2A1D15] border border-[#4E3928] text-[#D4AF37] px-3 py-1 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      if(soundEnabled) playTempleSound('bell');
                      showNotification('Đã cập nhật hồ sơ phụng sự thành công!');
                    }}
                    className="w-full bg-[#D4AF37] text-[#140E0A] font-bold py-3 rounded-xl text-xs hover:bg-[#C59B27] transition shadow"
                  >
                    Lưu Thay Đổi Hồ Sơ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL CHI TIẾT PHẬT SỰ & XÁC NHẬN ĐĂNG KÝ */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C120C] border border-[#5A422D] rounded-3xl max-w-lg w-full p-6 relative shadow-2xl animate-scale-in">
            <button 
              onClick={() => setActiveTaskModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-[#2A1D15]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs bg-[#2A1D15] text-[#D4AF37] px-3 py-1 rounded-full border border-[#4E3928]">
              {activeTaskModal.category}
            </span>

            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#F3E5AB] mt-3 mb-2">
              {activeTaskModal.title}
            </h3>

            <div className="space-y-2 text-xs text-[#C8B6A6] my-4 bg-[#2A1D15] p-4 rounded-2xl border border-[#3D2C1E]">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <strong className="text-[#EFE6DA]">{activeTaskModal.temple}</strong>
              </div>
              <p className="pl-6 text-gray-400">{activeTaskModal.address}</p>
              <div className="flex items-center space-x-4 pt-2">
                <span className="flex items-center space-x-1.5 text-[#F3E5AB]">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>{activeTaskModal.date}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#F3E5AB]">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>{activeTaskModal.time}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300 mb-6">
              <div>
                <h4 className="font-semibold text-[#D4AF37] mb-1">Mô tả công việc:</h4>
                <p className="leading-relaxed">{activeTaskModal.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#D4AF37] mb-1">Yêu cầu chung:</h4>
                <p className="leading-relaxed">{activeTaskModal.requirements}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[#E25822] font-semibold">Điểm phước thưởng: +{activeTaskModal.points} điểm</span>
                <span className="text-gray-400">Đã đăng ký: {activeTaskModal.slotsRegistered}/{activeTaskModal.slotsTotal} người</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setActiveTaskModal(null)}
                className="flex-1 bg-[#2A1D15] text-gray-300 py-3 rounded-xl font-medium text-xs hover:bg-[#3D2C1E] transition"
              >
                Đóng
              </button>
              <button 
                onClick={() => handleRegisterTask(activeTaskModal)}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#140E0A] py-3 rounded-xl font-bold text-xs shadow-lg hover:opacity-90 transition"
              >
                Xác Nhận Đăng Ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MÃ QR ĐIỂM DANH TẠI CHÙA */}
      {showQRModal && currentQRTask && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C120C] border border-[#D4AF37] rounded-3xl max-w-sm w-full p-6 text-center relative shadow-2xl">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-[#2A1D15]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs bg-[#2A1D15] text-[#D4AF37] px-3 py-1 rounded-full border border-[#4E3928]">
              Điểm Danh Phụng Sự
            </span>

            <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#F3E5AB] mt-3 mb-1">
              {currentQRTask.temple}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{currentQRTask.title}</p>

            {/* Giả lập mã QR Code */}
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-inner relative">
              <div className="w-full h-full border-4 border-dashed border-[#140E0A] flex flex-col items-center justify-center p-2 text-center">
                <ShieldCheck className="w-16 h-16 text-[#140E0A] mb-1" />
                <span className="text-[10px] font-bold text-[#140E0A]">QR CHECK-IN PHẬT TỬ</span>
              </div>
            </div>

            <p className="text-xs text-[#C8B6A6] mt-4">
              Đưa mã QR này cho Ban Hậu Cần / Ban Trị Sự quét khi bạn đến chùa để ghi nhận giờ công quả.
            </p>

            <div className="mt-6">
              <button 
                onClick={() => setShowQRModal(false)}
                className="w-full bg-[#D4AF37] text-[#140E0A] font-bold py-2.5 rounded-xl text-xs hover:bg-[#C59B27] transition"
              >
                Đóng Mã QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION BOTTOM BAR (DI ĐỘNG & DESKTOP) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C120C]/95 backdrop-blur-md border-t border-[#3D2C1E] shadow-2xl">
        <div className="max-w-md mx-auto px-4 py-2 flex justify-around items-center">
          <button 
            onClick={() => { if(soundEnabled) playTempleSound('mora'); setActiveTab('home'); }}
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'home' ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Phật Sự</span>
          </button>

          <button 
            onClick={() => { if(soundEnabled) playTempleSound('mora'); setActiveTab('schedule'); }}
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition relative ${
              activeTab === 'schedule' ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Lịch Trình</span>
            {registeredTasks.length > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 bg-[#E25822] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {registeredTasks.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { if(soundEnabled) playTempleSound('mora'); setActiveTab('passport'); }}
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'passport' ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-medium">Sổ Tay</span>
          </button>

          <button 
            onClick={() => { if(soundEnabled) playTempleSound('mora'); setActiveTab('profile'); }}
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'profile' ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Phật Tử</span>
          </button>
        </div>
      </nav>

    </div>
  );
}