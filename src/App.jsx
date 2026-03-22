import React, { useState, useMemo, useEffect } from 'react';
import { Search, Info, Trash2, AlertCircle, Volume2, Globe, X, HelpCircle, AlertTriangle } from 'lucide-react';
import * as wanakana from 'wanakana';
import Fuse from 'fuse.js';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [isSpeaking, setIsSpeaking] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [trashData, setTrashData] = useState([]);

  // データは外部 JSON から取得する（存在しない場合は初期値をフォールバックとして使用）
  const initialTrashData = [
    { name: "ICレコーダー", category: "こがたかでん", note: "指定場所の回収ボックスへ。" },
    { name: "アイスのようき（紙製）", category: "かねんごみ", note: "" },
    { name: "アイスのようき（プラスチック製）", category: "しげんぶつ（プラようき）", note: "中を空にし、洗う。" },
    { name: "アイスノン", category: "ふねんごみ", note: "" },
    { name: "アイスピック", category: "ふねんごみ", note: "先の部分を紙などで包み「危険」と書く。" },
    { name: "アイロン", category: "ふねんごみ", note: "" },
    { name: "アイロン台", category: "そだいごみ", note: "" },
    { name: "アカすり（天然素材製）", category: "かねんごみ", note: "" },
    { name: "アカすり（天然素材製以外）", category: "ふねんごみ", note: "" },
    { name: "あきカン", category: "しげんぶつ（あきカン）", note: "中を空にし、洗う。" },
    { name: "あきビン（飲食物）", category: "しげんぶつ（あきビン）", note: "キャップを取る。中を洗う。3色に分ける。" },
    { name: "あきビン（飲食物以外）", category: "ふねんごみ", note: "しげんぶつには出さない。" },
    { name: "アコーディオンカーテン", category: "そだいごみ", note: "" },
    { name: "アコーディオン（楽器）", category: "そだいごみ", note: "" },
    { name: "足ふきマット（天然素材製）", category: "かねんごみ", note: "" },
    { name: "足ふきマット（天然素材製以外）", category: "ふねんごみ", note: "" },
    { name: "アダプター", category: "こがたかでん", note: "指定場所の回収ボックスへ。" },
    { name: "厚紙", category: "しげんぶつ（こし・こふ）", note: "詳細は「こし」をご覧ください。" },
    { name: "圧力鍋", category: "しげんぶつ（あきカン）", note: "" },
    { name: "油紙", category: "かねんごみ", note: "" },
    { name: "油こしのようき（きんぞく）", category: "しげんぶつ（あきカン）", note: "" },
    { name: "油さし", category: "ふねんごみ", note: "中身は取り除く。" },
    { name: "油粘土（学校教材用）", category: "ふねんごみ", note: "" },
    { name: "リズムマシーン", category: "ふねんごみ", note: "指定袋に入らない物はそだいごみへ。" },
    { name: "リップクリームのようき", category: "しげんぶつ（プラようき）", note: "中は空にする。" },
    { name: "リボン（天然素材製）", category: "かねんごみ", note: "" },
    { name: "リボン（天然素材製以外）", category: "ふねんごみ", note: "" },
    { name: "リボン（プリンター用）", category: "ふねんごみ", note: "" },
    { name: "リモコン", category: "ふねんごみ", note: "乾電池はゆうがいごみへ。" },
    { name: "リヤカー", category: "そだいごみ", note: "市により出し方が異なる場合あり。詳細は市へ。" },
    { name: "リュックサック（布製）", category: "かねんごみ", note: "" },
    { name: "リュックサック（布製以外）", category: "ふねんごみ", note: "" },
    { name: "両手鍋（きんぞく製）", category: "しげんぶつ（あきカン）", note: "" },
    { name: "両手鍋（耐熱ガラス製）", category: "ふねんごみ", note: "" },
    { name: "両面テープ", category: "ふねんごみ", note: "" },
    { name: "りんごを包んだ外袋（プラ製）", category: "しげんぶつ（プラようき）", note: "" },
    { name: "りんごを包んだ発泡ネット", category: "しげんぶつ（プラようき）", note: "" },
    { name: "リンスのようき", category: "しげんぶつ（プラようき）", note: "中を空にし、洗う。" },
    { name: "ルーズリーフ", category: "しげんぶつ（こし・こふ）", note: "詳細は「こし」をご覧ください。" },
    { name: "ルーズリーフファイル", category: "ふねんごみ", note: "" },
    { name: "ルーペ", category: "ふねんごみ", note: "" },
    { name: "ルームランナー", category: "そだいごみ", note: "" },
    { name: "冷蔵庫", category: "しゅうしゅうできません", note: "詳細は「しゅうしゅうできないごみ」を確認。" },
    { name: "冷蔵庫脱臭剤のようき", category: "しげんぶつ（プラようき）", note: "" },
    { name: "冷凍庫（冷凍機能のみの物）", category: "しゅうしゅうできません", note: "詳細は「しゅうしゅうできないごみ」を確認。" },
    { name: "冷凍食品の袋", category: "しげんぶつ（プラようき）", note: "" },
    { name: "冷凍保存パック", category: "ふねんごみ", note: "" },
    { name: "冷風機", category: "そだいごみ", note: "指定袋に入る物はふねんごみへ。" },
    { name: "レーキ", category: "そだいごみ", note: "" },
    { name: "レコード盤", category: "ふねんごみ", note: "" },
    { name: "レコードプレーヤー", category: "そだいごみ", note: "指定袋に入る物はふねんごみへ。" },
    { name: "レシート", category: "かねんごみ", note: "" },
    { name: "レジ袋", category: "しげんぶつ（プラようき）", note: "" }
  ];

useEffect(() => {
    fetch("/data/gomi.json")
      .then((response) => {
        if (!response.ok) throw new Error("ファイルが開けませんでした");
        return response.json();
      })
      .then((data) => {
        setTrashData(data);
      })
      .catch((error) => {
        console.error("読み込みエラー:", error);
        setTrashData(initialTrashData);
      });
  }, []);

const categories = useMemo(() => {
    // ① ここに表示したい「理想の順番」を書く
    const order = [
      'すべて',
      'かねんごみ',
      'ふねんごみ（きんぞくるい・われもの）',
      'ふねんごみ（プラスチックるい）',
      'しげんぶつ（プラようき）',
      'しげんぶつ（ペットボトル）',
      'しげんぶつ（あきカン）',
      'しげんぶつ（あきビン）',
      'しげんぶつ',
      'しげんぶつ（こし）',
      'しげんぶつ（こふ）',
      'そだいごみ',
      'ゆうがいごみ',
      'こがたかでん',
      'しゅうしゅうできません'
    ];
    return order;
  }, []);

  const filteredData = useMemo(() => {
    // 検索語がない場合は、カテゴリーの一致だけで判断して全件（またはカテゴリ全件）返す
    if (!searchTerm || searchTerm.trim() === '') {
      return trashData.filter(item => 
        selectedCategory === 'すべて' || item.category === selectedCategory
      );
    }

    // 検索語がある場合の処理（wanakanaを活用）
    const term = searchTerm.toLowerCase();
    const termHira = wanakana.toHiragana(term);

    return trashData.filter(item => {
      // 1. カテゴリーが一致するか
      const matchesCategory = selectedCategory === 'すべて' || item.category === selectedCategory;
      
      // 2. 名前が一致するか（元のロジック：漢字・英字・ひらがな両方でチェック）
      const name = item.name.toLowerCase();
      const nameHira = wanakana.toHiragana(name);
      const matchesSearch = name.includes(term) || nameHira.includes(termHira);

      // 両方満たしているものだけを表示
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, trashData]);

  // Fuse.js を使った高度検索は動的インポートで行う（パッケージ未インストールでも動作する）
  const [fuseInstance, setFuseInstance] = useState(null);
  useEffect(() => {
    let mounted = true;
    if (!searchTerm) return;
    import('fuse.js').then(mod => {
      if (!mounted) return;
      try {
        const Fuse = mod.default;
        const list = trashData.map(item => ({
          ...item,
          name_hira: wanakana.toHiragana(item.name),
          name_roma: wanakana.toRomaji(item.name),
        }));
        const f = new Fuse(list, { keys: ['name', 'name_hira', 'name_roma', 'category', 'note'], threshold: 0.35, includeMatches: true });
        setFuseInstance(f);
      } catch (e) {
        setFuseInstance(null);
      }
    }).catch(() => setFuseInstance(null));
    return () => { mounted = false; };
  }, [searchTerm, trashData]);

  const searchResults = useMemo(() => {
    if (fuseInstance && searchTerm) {
      const res = fuseInstance.search(searchTerm);
      return res.map(r => ({ item: r.item, matches: r.matches, index: trashData.indexOf(r.item) }));
    }
    return filteredData.map((item, idx) => ({ item, matches: [], index: idx }));
  }, [fuseInstance, searchTerm, filteredData, trashData]);

  const renderHighlighted = (text, matches) => {
    if (!matches || matches.length === 0) return text;
    const nameMatch = matches.find(m => m.key === 'name');
    if (!nameMatch || !nameMatch.indices) return text;
    const parts = [];
    let lastIndex = 0;
    nameMatch.indices.forEach(([start, end], i) => {
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
      parts.push(<mark key={i} className="bg-yellow-200 rounded px-0.5">{text.slice(start, end + 1)}</mark>);
      lastIndex = end + 1;
    });
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
  };

  const speak = (item, index) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(index);
      
      const texts = [
        item.name,
        item.category,
        item.note
      ].filter(t => t);
      
      let currentIndex = 0;
      
      const speakNext = () => {
        if (currentIndex >= texts.length) {
          setIsSpeaking(null);
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(texts[currentIndex]);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;
        
        utterance.onstart = () => setIsSpeaking(index);
        utterance.onend = () => {
          currentIndex++;
          speakNext();
        };
        utterance.onerror = () => {
          setIsSpeaking(null);
        };
        
        window.speechSynthesis.speak(utterance);
      };
      
      speakNext();
    }
  };

  const cancelSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        cancelSpeech();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

const getCategoryColor = (category) => {
  // 【改善点】資源系（緑色）の判定を一番上にまとめました
  // 「しげんぶつ（ペットボトル）」も「しげんぶつ（プラようき）」もここを通るので緑になります
  if (
    category.includes('しげんぶつ') || 
    category.includes('こし') || 
    category.includes('こふ') || 
    category.includes('あき') || 
    category === 'ペットボトル'
  ) {
    return 'bg-green-100 text-green-800 border-green-300';
  }

  switch (category) {
  case 'かねんごみ': 
    return 'bg-red-100 text-red-800 border-red-300';

  case 'ふねんごみ（プラスチックるい）': 
    return 'bg-blue-100 text-blue-800 border-blue-300';

  case 'ふねんごみ（きんぞくるい・われもの）': 
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';

  case 'そだいごみ': 
    return 'bg-orange-100 text-orange-800 border-orange-300';

  case 'ゆうがいごみ': 
    return 'bg-purple-100 text-purple-800 border-purple-300';

  case 'こがたかでん': 
    return 'bg-lime-100 text-lime-800 border-lime-300';

  case 'しゅうしゅうできません': 
    return 'bg-slate-200 text-slate-800 border-slate-400';

  default: 
    return 'bg-gray-100 text-gray-700 border-gray-300';
}
};

const getCategoryIcon = (category) => {
    switch (category) {
      case 'かねんごみ':
        return (
          <svg width="36" height="36" viewBox="0 0 100 100" className="fill-current text-red-600" style={{ minWidth: '36px' }}>
            <path d="M50 5 C50 5, 75 30, 75 55 C75 75, 60 95, 50 95 C40 95, 25 75, 25 55 C25 30, 50 5, 50 5 Z" />
            <path d="M50 30 C50 30, 60 45, 60 60 C60 75, 50 85, 50 85 C50 85, 40 75, 40 60 C40 45, 50 30, 50 30 Z" fill="white" />
          </svg>
        );

      case 'ふねんごみ（プラスチックるい）':
        return (
          <svg width="36" height="36" viewBox="0 0 100 100" className="text-blue-600" style={{ minWidth: '36px' }}>
            <path d="M50 25 C50 25, 65 40, 65 55 C65 65, 58 75, 50 75 C42 75, 35 65, 35 55 C35 40, 50 25, 50 25 Z" fill="#ef4444" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" />
            <line x1="22" y1="22" x2="78" y2="78" stroke="currentColor" strokeWidth="8" />
          </svg>
        );

      case 'ふねんごみ（きんぞくるい・われもの）':
        return (
          <svg width="36" height="36" viewBox="0 0 100 100" style={{ minWidth: '36px' }}>
  {/* 内側の赤い図形（そのまま維持） */}
  <path d="M50 25 C50 25, 65 40, 65 55 C65 65, 58 75, 50 75 C42 75, 35 65, 35 55 C35 40, 50 25, 50 25 Z" fill="#ef4444" />
  
  {/* 外側の円（青から黄色 [#facc15] に変更） */}
  <circle cx="50" cy="50" r="40" fill="none" stroke="#facc15" strokeWidth="8" />
  
  {/* 斜線（青から黄色 [#facc15] に変更） */}
  <line x1="22" y1="22" x2="78" y2="78" stroke="#facc15" strokeWidth="8" />
</svg>
        );

      case 'しげんぶつ（プラようき）':
        return (
          <svg width="36" height="36" viewBox="0 0 100 100" className="fill-current" style={{ minWidth: '36px' }}>
            <rect x="15" y="15" width="70" height="70" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="9" />
            <path d="M85,38 L75,28 M85,38 L95,28" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15,62 L25,72 M15,62 L5,72" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="50" y="60" fontSize="30" fontWeight="900" textAnchor="middle" fill="currentColor">プラ</text>
          </svg>
        );

      case 'しげんぶつ（ペットボトル）': 
        return (
          <svg 
        width="36" 
        height="36" 
        viewBox="0 0 100 100" 
        className="text-green-600"
        style={{ minWidth: '36px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 循環する3つの「帯」ユニット
            strokeWidth="5" で細身にし、数字とのスペースを確保。
            全体を中央（重心）に寄せてサイズ感をコントロールしています。
        */}
        <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          
          {/* 上の角ユニット */}
          <path d="M40 42 L50 20 L60 42" />
          <path d="M54 35 L60 42 L58 32" />
          
          {/* 右下の角ユニット */}
          <path d="M70 55 L82 75 L45 75" />
          <path d="M55 70 L45 75 L55 80" />
          
          {/* 左下の角ユニット */}
          <path d="M35 75 L18 75 L30 55" />
          <path d="M22 62 L30 55 L35 65" />

        </g>

        {/* 中央の「1」：
            線の範囲を広げたことで、重ならずに大きく配置できています。
        */}
        <text 
          x="50" 
          y="62" 
          fontSize="32" 
          fontWeight="900" 
          textAnchor="middle" 
          fill="currentColor" 
          style={{ fontFamily: 'sans-serif' }}
        >
          1
        </text>

        {/* 下部の「PET」：
            アイコン全体の重心が上がったため、バランスの良い位置に配置。
        */}
        <text 
          x="50" 
          y="95" 
          fontSize="18" 
          fontWeight="900" 
          textAnchor="middle" 
          fill="currentColor" 
          style={{ fontFamily: 'sans-serif' }}
        >
          PET
        </text>
      </svg>
        );

      case 'しげんぶつ（あきビン）':
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 100 100" 
      className="text-green-600" // 資源物のイメージカラー（緑）
      style={{ minWidth: '36px' }}
    >
      {/* ビンのシルエット */}
      <path 
        d="M42 15 L58 15 L58 25 Q58 35 65 40 L65 70 L35 70 L35 40 Q42 35 42 25 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinejoin="round"
      />
      {/* ビンのラベル部分 */}
      <rect x="42" y="45" width="16" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* 下部の文字「あきビン」：濃いグレー */}
      <text 
        x="50" 
        y="92" 
        fontSize="16" 
        fontWeight="900" 
        textAnchor="middle" 
        fill="#4b5563" // 濃グレー（slate-700相当）
        style={{ fontFamily: 'sans-serif', letterSpacing: '-0.5px' }}
      >
        あきビン
      </text>
    </svg>
  );
  case 'しげんぶつ（あきカン）': 
      return (
      <svg width="36" height="36" viewBox="0 0 100 100" className="text-orange-600" style={{ minWidth: '36px' }}>
  {/* 缶本体の輪郭（枠線） 
    fill="none" にすることで中身を塗らず、背景色にします。
    タンスのアイコンに合わせて strokeWidth="6" に設定。
  */}
  <path 
    d="M30 30V75C30 81 39 85 50 85C61 85 70 81 70 75V30" 
    fill="none" 
    stroke="#4CAF50" 
    strokeWidth="6" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  />

  {/* 缶の上部の縁（フタ） */}
  <ellipse 
    cx="50" 
    cy="30" 
    rx="20" 
    ry="7" 
    fill="none" 
    stroke="#4CAF50" 
    strokeWidth="6" 
  />

  {/* プルタブ（中身） 
    ここだけは塗っておかないと、何もない空間になってしまうため、
    タンスの取っ手（circle）と同じように currentColor で塗りつぶします。
  */}
  <circle cx="50" cy="30" r="3" fill="#4CAF50" />
</svg>
      );
      case 'しげんぶつ（こし）': 
      return (
       <svg width="36" height="36" viewBox="0 0 100 100">
  {/* フォントを直接指定。太字（bold）で視認性も抜群です */}
  <text 
    x="50%" 
    y="55%" 
    dominantBaseline="middle" 
    textAnchor="middle" 
    fontSize="50" 
    fontWeight="bold" 
    fontFamily="sans-serif"
    fill="black"
  >
    紙
  </text>
  {/* 外側の矢印：シンプルに2本の太い円弧にしています */}
  <g fill="none" stroke="black" strokeWidth="8" strokeLinecap="round">
    {/* 右上の矢印 */}
    <path d="M20 30 A40 40 0 0 1 80 30" />
    {/* 左下の矢印 */}
    <path d="M80 70 A40 40 0 0 1 20 70" />
  </g>

  {/* 矢印の三角部分 */}
  <path d="M75 18 L92 32 L75 46 Z" fill="black" />
  <path d="M25 82 L8 68 L25 54 Z" fill="black" />
</svg>
        );
      case 'しげんぶつ（こふ）': 
      return (
       <svg width="36" height="36" viewBox="0 0 100 100">
  {/* フォントを直接指定。太字（bold）で視認性も抜群です */}
  <text 
    x="50%" 
    y="55%" 
    dominantBaseline="middle" 
    textAnchor="middle" 
    fontSize="50" 
    fontWeight="bold" 
    fontFamily="sans-serif"
    fill="black"
  >
    布
  </text>
  {/* 外側の矢印：シンプルに2本の太い円弧にしています */}
  <g fill="none" stroke="black" strokeWidth="8" strokeLinecap="round">
    {/* 右上の矢印 */}
    <path d="M20 30 A40 40 0 0 1 80 30" />
    {/* 左下の矢印 */}
    <path d="M80 70 A40 40 0 0 1 20 70" />
  </g>

  {/* 矢印の三角部分 */}
  <path d="M75 18 L92 32 L75 46 Z" fill="black" />
  <path d="M25 82 L8 68 L25 54 Z" fill="black" />
</svg>
        );
      case 'そだいごみ':
      return (
        <svg width="36" height="36" viewBox="0 0 100 100" className="fill-current text-orange-600" style={{ minWidth: '36px' }}>
          {/* 外枠（タンスの本体） */}
          <rect x="20" y="20" width="60" height="65" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
          {/* 1段目の引き出し */}
          <line x1="20" y1="42" x2="80" y2="42" stroke="currentColor" strokeWidth="4" />
          <circle cx="50" cy="31" r="3" fill="currentColor" />
          {/* 2段目の引き出し */}
          <line x1="20" y1="64" x2="80" y2="64" stroke="currentColor" strokeWidth="4" />
          <circle cx="50" cy="53" r="3" fill="currentColor" />
          {/* 3段目の引き出し */}
          <circle cx="50" cy="75" r="3" fill="currentColor" />
          {/* 足 */}
          <line x1="30" y1="85" x2="30" y2="92" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <line x1="70" y1="85" x2="70" y2="92" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
      case 'こがたかでん':
        return (
          <svg 
      width="36" 
      height="36" 
      viewBox="0 0 100 100" 
      className="text-black" 
      style={{ minWidth: '36px' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外周のリサイクル矢印：背景なし、枠線のみ */}
      <path 
        d="M75 45 C75 25, 65 15, 45 15 C25 15, 15 35, 15 55 C15 75, 35 85, 55 85 C65 85, 75 80, 80 72" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      
      {/* 矢印の先端：ロゴの色と合わせるため塗りつぶし */}
      <path 
        d="M72 72 L82 72 L78 80 Z" 
        fill="currentColor" 
      />

      {/* 中央の「R」マーク：背景なし、枠線のみ */}
      <path 
        d="M40 35 V65 M40 35 H55 C60 35, 65 38, 65 43 C65 48, 60 51, 55 51 H40 M52 51 L65 65" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* 下部のテキスト「E-Waste」：黒色 */}
      <text 
        x="50" 
        y="98" 
        fontSize="12" 
        fontWeight="900" 
        fill="currentColor" 
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        E-Waste
      </text>
    </svg>
);

    // 【修正箇所】「すべて」のアイコン（ゴミ箱 + 虫眼鏡）
 case 'すべて':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 100"
          className="text-slate-600"
          style={{ minWidth: '40px' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ゴミ箱の本体 */}
          <path
            d="M35 35V80C35 83 37 85 40 85H60C63 85 65 83 65 80V35"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* ゴミ箱のフタ */}
          <path
            d="M30 35H70M44 35V28C44 26 46 25 48 25H52C54 25 56 26 56 28V35"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 虫眼鏡（右下に配置） */}
          <circle cx="68" cy="68" r="18" fill="white" /> {/* 背景を白抜きにして重なりを綺麗に */}
          <g transform="translate(52, 52) scale(0.9)">
            <circle
              cx="15"
              cy="15"
              r="10"
              fill="none"
              stroke="#2563eb"
              strokeWidth="7"
            />
            <line
              x1="23"
              y1="23"
              x2="32"
              y2="32"
              stroke="#2563eb"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

      case 'しゅうしゅうできません': return <AlertTriangle size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-2">
              <Trash2 className="text-blue-600" />
              <span style={{ display: 'inline-block' }}>ごみ　ぶんべつ</span>
              </div>
            <span style={{ display: 'inline-block' }}>けんさく　じてん</span>
            </h1>
            <p className="text-slate-500 text-sm">しなものの　なまえを　いれて、　ただしい　すてかたを　しらべましょう。</p>
          </div>
<div className="mt-4 flex flex-col gap-4 bg-white p-5 rounded-2xl shadow-sm relative z-50">
  
  {/* 1段目：カテゴリー選択（幅を100%にして文字切れを防ぐ） */}
<div className="w-full min-w-0">
  <p className="text-sm text-slate-700 font-bold mb-1 ml-1">ごみの しゅるいを えらぶ</p>
  
 <div className="flex items-center gap-2 w-full min-w-0">
    {/* アイコン部分：固定幅（flex-shrink-0）にして潰れないようにする */}
    <div className={`flex-shrink-0 p-2 rounded-xl border-2 flex items-center justify-center bg-white ${getCategoryColor(selectedCategory)}`} style={{ width: '60px', height: '60px' }}>
      {getCategoryIcon(selectedCategory)}
    </div>

    {/* セレクトボックス：w-full と min-w-0 を組み合わせて親の幅に収める */}
    <div className="relative flex-grow min-w-0">
      <select
        aria-label="カテゴリ絞り込み"
        className={`w-full rounded-xl border-2 pl-4 pr-10 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none text-slate-900 truncate ${getCategoryColor(selectedCategory)}`}
        style={{ fontSize: '18px', fontWeight: 'bold' }}
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {categories.map(cat => (
          <option key={cat} value={cat} className="bg-white text-slate-900">
            {cat}
          </option>
        ))}
      </select>
      {/* セレクトボックスの右矢印アイコン（自作） */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
</div>

  {/* 2段目：検索エリア（幅を100%にして入力しやすくする） */}
  <div className="relative w-full z-[999]">
    <p className="text-xs text-slate-400 mb-1 ml-1">なまえを いれて さがす</p>
 <div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
  <input
    type="text"
    placeholder="すてたい ものの なまえ"
    className="w-full pl-12 pr-12 py-5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-900 font-bold text-base sm:text-lg md:text-xl"
    style={{ fontSize: '20px' }}
    value={searchTerm}
    onChange={(e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.length > 0) {
        // 文字があるとき：カテゴリーを「すべて」にして検索
        setSelectedCategory('すべて');
        const results = trashData
          .filter(item => 
            item.name.includes(value) || 
            (item.note && item.note.includes(value))
          )
          .map((item, idx) => ({ item, matches: [], index: idx }));
        
        // サジェストの更新
        const term = value.toLowerCase();
        const termHira = wanakana.toHiragana(term);
        const filtered = trashData.filter(item => {
          const name = item.name.toLowerCase();
          const nameHira = wanakana.toHiragana(name);
          return name.includes(term) || nameHira.includes(termHira);
        }).slice(0, 10);
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    }}
  />

  {/* 【修正】バツボタン：searchTermがあるときだけ表示 */}
  {searchTerm && (
    <button
      onClick={() => {
        setSearchTerm('');      // 文字を消す
        setSuggestions([]);    // 候補リストを消す
      }}
      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-[1000]"
      aria-label="文字を消す"
    >
      <X size={20} strokeWidth={3} />
    </button>
  )}
</div>

    {/* 検索候補（サジェスト）のリスト */}
    {suggestions.length > 0 && (
      <ul className="absolute left-0 right-0 top-full mt-2 z-[9999] bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden">
        {suggestions.map((item, i) => (
          <li
            key={i}
            className="px-5 py-4 text-xl hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-none text-slate-900"
            onClick={() => {
              setSearchTerm(item.name);
              setSuggestions([]);
            }}
          >
            {item.name}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
</header>

          <div className="mt-2 flex items-center justify-center gap-3">
            <div aria-live="polite" className="text-sm text-slate-500">{searchResults ? `${searchResults.length} 件` : ''}</div>
            {isSpeaking !== null && (
              <button
                onClick={cancelSpeech}
                className="px-3 py-1 rounded-full bg-red-600 text-white text-sm"
                aria-label="読み上げを停止"
              >
                読み上げ停止
              </button>
            )}
          </div>

<div className="bg-slate-100 p-8 mb-6 rounded-2xl">
          <div className="mt-4">
            {filteredData.length > 0 ? (
              <div id="results-list" role="list" aria-live="polite" className="space-y-8">
                {filteredData.map((item, index) => (
                  <div 
                    key={index} 
                    role="listitem"
                    className={`p-6 rounded-2xl border border-slate-200 transition-all ${
                      isSpeaking === index ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-white'
                    }`} 
                    style={{ borderRadius: '6px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-2xl md:text-3xl">{item.name}</h3>
                          <button 
                            onClick={() => speak(item, index)}
                            className={`p-1.5 rounded-full ${isSpeaking === index ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
                          >
                            <Volume2 size={18} />
                          </button>
                        </div>
                        <div className="mt-3 bg-slate-50 rounded-lg p-3">
                          <div className="flex flex-wrap gap-2 mb-2 w-full min-w-0">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-sm sm:text-base max-w-full ${getCategoryColor(item.category)}`}
                            >
                             {/* アイコンが潰れないように flex-shrink-0 を指定 */}
                              <div className="flex-shrink-0 flex items-center justify-center">
                                {getCategoryIcon(item.category)}
                              </div>
    
                            {/* テキスト：はみ出る場合は折り返しを許可、または適切に省略 */}
                              <span className="leading-tight break-words">
                              {item.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm font-bold">{item.category}</div>
                          {item.note && <p className="text-slate-600 text-sm mt-1">{item.note}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                見つかりませんでした
              </div>
            )}
          </div>
        </div>
            <footer className="mt-12 mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-600 text-sm md:text-base">
            <div className="space-y-4 leading-relaxed">
            {/* 1. 出典・参考情報のセクション */}
            <div>
              <p className="font-bold text-slate-800 mb-2 text-lg">
                この サイトの ルールに ついて
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  この サイトは、<span className="font-bold text-blue-600">「じょうそうし（みつかいどう ちく）」</span>の ごみ出し（だし）ルールを 基本（きほん）にして 作（つく）りました。
                </li>
                <li>
                  <span className="font-bold text-green-600">【 不燃（ふねん）ごみのルールについて】</span><br />
                  「不燃（ふねん）ごみ」の中（なか）でも、<span className="font-bold">「プラスチックの もの」</span>と<span className="font-bold">「きんぞく・われもの」</span>を 分（わ）ける ルールは、もりやしの 最新（さいしん）パンフレット（2025年）を 参考（さんこう）に しています。
                </li>
              </ul>
            </div>

            {/* 2. 免責事項（ちゅうい）のセクション */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-red-600 font-bold mb-2">
                【ちゅうい：気（き）をつけて ください】
              </p>
              <p>
                ごみを 出（だ）す ルールが 変（か）わることが あります。
                一番（いちばん） 正（ただ）しい ルールは、公式（こうしき）ホームページで 確認（かくにん）して ください。
              </p>
            </div>
            
            {/* 3. 公式URLのセクション */}
            <div className="mt-4 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-700 mb-1">■ じょうそうしばん 「じょうそうこういきけん かていごみぶんべつの てびき」</p>
                <a 
                  href="https://www.city.joso.lg.jp/kurashi_gyousei/kurashi/gomi_kankyou/recycle/homegomi/mitsukaido/housebunbtsu.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all hover:text-blue-800"
                >
                  https://www.city.joso.lg.jp/kurashi_gyousei/kurashi/gomi_kankyou/recycle/homegomi/mitsukaido/housebunbtsu.html
                </a>
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-1">■ もりやしばん 「じょうそうこういきけん かていごみぶんべつの てびき」</p>
                <a 
                  href="https://www.city.moriya.ibaraki.jp/_res/projects/default_project/_page_/001/002/064/bunbetu2025kai.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all hover:text-blue-800"
                >
                  https://www.city.moriya.ibaraki.jp/_res/projects/default_project/_page_/001/002/064/bunbetu2025kai.pdf
                </a>
              </div>
            </div>

            {/* 4. 手動での日付更新セクション */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-800 text-right italic font-sans">
              <p>作成（さくせい）した日：2026年3月18日</p>
              <p>© 2026 [なかむら（ふじかわ）]. All rights reserved.</p>
              <p>この サイトの 内容（ないよう）を、勝手（かって）に コピーして 使（つか）わないで ください。</p>
              <p>いまは、正（ただ）しく 動（うご）くか テストして いる ところです。</p>
              <p>※自治体（じちたい）の 最新（さいしん）情報を 確認（かくにん）してください。</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
