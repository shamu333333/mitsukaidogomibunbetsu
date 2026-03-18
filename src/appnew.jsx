import React, { useState, useEffect, useMemo } from 'react';
import { Search, Info, Trash2, Recycle, AlertTriangle, HelpCircle, Volume2, X } from 'lucide-react';
import * as wanakana from 'wanakana';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [isSpeaking, setIsSpeaking] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [trashData, setTrashData] = useState([]);

  // 初期データ（JSON読み込み失敗時のフォールバック）
  const initialTrashData = [
    { name: "ICレコーダー", category: "こがたかでん", note: "指定場所の回収ボックスへ。" },
    { name: "あきカン", category: "しげんぶつ（あきカン）", note: "中を空にし、洗う。" },
    { name: "ロジンバッグ", category: "かねんごみ", note: "やきゅうの すべりどめ。こなみが 飛ばないように 袋を 二重にする。" },
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

  const categories = useMemo(() => [
    'すべて', 'かねんごみ', 'ふねんごみ（きんぞくるい・われもの）', 
    'ふねんごみ（プラスチックるい）', 'しげんぶつ（プラようき）', 
    'しげんぶつ（ペットボトル）', 'しげんぶつ（あきカン）', 
    'しげんぶつ（あきビン）', 'しげんぶつ（こし）', 
    'しげんぶつ（こふ）', 'そだいごみ', 'ゆうがいごみ', 
    'こがたかでん', 'しゅうしゅうできません'
  ], []);

  // カテゴリーのみで絞り込んだデータ
  const filteredData = useMemo(() => {
    return trashData.filter(item => 
      selectedCategory === 'すべて' || item.category === selectedCategory
    );
  }, [selectedCategory, trashData]);

  // Fuse.js インスタンスの生成
  const [fuseInstance, setFuseInstance] = useState(null);
  useEffect(() => {
    if (!searchTerm) return;
    import('fuse.js').then(mod => {
      const Fuse = mod.default;
      const list = trashData.map(item => ({
        ...item,
        name_hira: wanakana.toHiragana(item.name),
        name_roma: wanakana.toRomaji(item.name),
      }));
      const f = new Fuse(list, { 
        keys: ['name', 'name_hira', 'name_roma', 'note'], 
        threshold: 0.35, 
        includeMatches: true 
      });
      setFuseInstance(f);
    });
  }, [searchTerm, trashData]);

  // 【最重要】検索結果の計算ロジック
  const searchResults = useMemo(() => {
    // 検索語がある場合は検索結果を返す
    if (searchTerm && fuseInstance) {
      const res = fuseInstance.search(searchTerm);
      return res.map(r => ({ item: r.item, matches: r.matches, index: trashData.indexOf(r.item) }));
    }
    // 検索語がない場合は、カテゴリー絞り込み済みの全データを返す
    return filteredData.map((item, idx) => ({ item, matches: [], index: idx }));
  }, [fuseInstance, searchTerm, filteredData, trashData]);

  // 読み上げ機能
  const speak = (item, index) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${item.name}。${item.category}。${item.note || ''}`);
      utterance.lang = 'ja-JP';
      utterance.onstart = () => setIsSpeaking(index);
      utterance.onend = () => setIsSpeaking(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const cancelSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(null);
  };

  const getCategoryColor = (category) => {
    if (category.includes('しげんぶつ') || category.includes('こし') || category.includes('こふ') || category.includes('あき')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    switch (category) {
      case 'かねんごみ': return 'bg-red-100 text-red-800 border-red-300';
      case 'そだいごみ': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'しゅうしゅうできません': return 'bg-slate-200 text-slate-800 border-slate-400';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getCategoryIcon = (category) => {
    if (category === 'すべて') return <Search size={24} className="text-slate-500" />;
    if (category === 'しゅうしゅうできません') return <AlertTriangle size={24} className="text-slate-600" />;
    return <Trash2 size={24} />;
  };

  const renderHighlighted = (text, matches) => {
    if (!matches || matches.length === 0) return text;
    return text; // 簡易化のためハイライト処理は省略（Fuseのmatchesを使用可能）
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <Trash2 className="text-blue-600" /> ごみぶんべつ けんさく
          </h1>
          
          <div className="mt-6 flex flex-col gap-4 bg-white p-5 rounded-2xl shadow-sm">
            {/* カテゴリー選択 */}
            <div className="w-full">
              <p className="text-sm font-bold mb-1 text-left">しゅるいを えらぶ</p>
              <div className="flex gap-2">
                <div className={`p-4 rounded-xl border-2 flex items-center justify-center ${getCategoryColor(selectedCategory)}`}>
                  {getCategoryIcon(selectedCategory)}
                </div>
                <select 
                  className={`flex-grow rounded-xl border-2 px-4 py-3 font-bold text-lg appearance-none ${getCategoryColor(selectedCategory)}`}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* 検索窓 */}
            <div className="relative w-full">
              <p className="text-sm font-bold mb-1 text-left">なまえを いれる</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="れい：アイス"
                  className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl text-xl focus:border-blue-400 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    if (val.length > 0) setSelectedCategory('すべて');
                    
                    // サジェスト更新
                    const filtered = trashData.filter(item => 
                      item.name.includes(val) || wanakana.toHiragana(item.name).includes(wanakana.toHiragana(val))
                    ).slice(0, 5);
                    setSuggestions(val ? filtered : []);
                  }}
                />
                {searchTerm && (
                  <button 
                    onClick={() => { setSearchTerm(''); setSuggestions([]); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-full text-slate-500"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* サジェストリスト */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <li 
                      key={i} 
                      className="px-5 py-3 text-lg hover:bg-blue-50 cursor-pointer border-b last:border-none text-left"
                      onClick={() => { setSearchTerm(s.name); setSuggestions([]); }}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-slate-500 font-bold">{searchResults.length} けん みつかりました</div>
        </header>

        <main className="space-y-4">
          {searchResults.map((res) => (
            <div key={res.index} className={`bg-white p-5 rounded-2xl border-2 transition-all ${isSpeaking === res.index ? 'border-blue-400 ring-2 ring-blue-100' : 'border-white'}`}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-2">{res.item.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold border ${getCategoryColor(res.item.category)}`}>
                      {res.item.category}
                    </span>
                  </div>
                  {res.item.note && <p className="text-slate-600 leading-relaxed">{res.item.note}</p>}
                </div>
                <button 
                  onClick={() => speak(res.item, res.index)}
                  className={`p-3 rounded-full ${isSpeaking === res.index ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  <Volume2 size={24} />
                </button>
              </div>
            </div>
          ))}
          
          {searchResults.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
              みつかりませんでした
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;