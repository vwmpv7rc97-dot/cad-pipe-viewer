import { useState, useMemo } from 'react';
import { partsDB, CATEGORIES, searchParts, partsByCategory } from '../data/partsDatabase';
import type { PartSpec } from '../data/partsDatabase';

interface Props {
  onSelectPart?: (part: PartSpec) => void;
  selectedPartId?: string;
}

export default function PartsCatalog({ onSelectPart, selectedPartId }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const filtered = useMemo(() => {
    let list = search ? searchParts(search) : partsDB;
    if (catFilter) list = list.filter(p => p.category === catFilter);
    return list;
  }, [search, catFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, PartSpec[]> = {};
    filtered.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="px-2 pt-2 pb-1 space-y-1.5">
        <input
          type="text"
          placeholder="搜索零件编号/名称/规格..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
        />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-400"
        >
          <option value="">全部类别 ({partsDB.length})</option>
          {CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{c.icon} {c.label} ({partsByCategory(c.key).length})</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-400">共 {filtered.length} 个零件</p>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto px-1">
        {Object.entries(grouped).map(([cat, parts]) => (
          <div key={cat} className="mb-2">
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase sticky top-0 bg-white">
              {CATEGORIES.find(c => c.key === cat)?.icon} {CATEGORIES.find(c => c.key === cat)?.label || cat}
              <span className="ml-1 text-gray-300">({parts.length})</span>
            </div>
            {parts.map(part => (
              <div
                key={part.id}
                onClick={() => onSelectPart?.(part)}
                className={`mx-1 mb-0.5 px-2.5 py-2 rounded-md cursor-pointer transition-all border ${
                  selectedPartId === part.id
                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                    : 'border-transparent hover:bg-gray-50 hover:border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-gray-700 truncate max-w-[160px]">{part.id}</span>
                  <span className="text-[10px] text-gray-400">{part.dn}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{part.name}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">{part.material}</span>
                  <span className="text-[10px] text-gray-400">{part.standard}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
