/* Branching circuit graph for a loop: threads fork off steps, resolved threads loop back to close */
import { useMemo } from 'react';
import { Loop, LoopAction, LoopThread } from '@/lib/loops';

const STEP = 78;
const LANE = 74;
const PAD = 44;

interface NodePos { a: LoopAction; x: number; y: number; thread: LoopThread }
interface LanePos { t: LoopThread; y: number; startX: number; startY: number; endX: number; nodes: NodePos[] }

function layout(loop: Loop) {
  const byParent = new Map<string, LoopThread[]>();
  for (const t of loop.threads) {
    const key = t.parentThreadId && loop.threads.some(x => x.id === t.parentThreadId) ? t.parentThreadId : 'root';
    byParent.set(key, [...(byParent.get(key) ?? []), t]);
  }
  const lanes: LanePos[] = [];
  const rootX = PAD;
  let lane = 0;
  const visit = (t: LoopThread, parent?: LanePos) => {
    const y = PAD + lane++ * LANE;
    let startX = rootX, startY = -1;
    if (parent) {
      const fork = parent.nodes.find(n => n.a.id === t.forkActionId) ?? parent.nodes[parent.nodes.length - 1];
      startX = fork ? fork.x : parent.startX;
      startY = fork ? fork.y : parent.y;
    }
    const nodes = t.nextActions.map((a, i) => ({ a, thread: t, x: startX + STEP * (i + 1), y }));
    const l: LanePos = { t, y, startX, startY, endX: startX + STEP * (t.nextActions.length + 1), nodes };
    lanes.push(l);
    for (const c of byParent.get(t.id) ?? []) visit(c, l);
  };
  for (const t of byParent.get('root') ?? []) visit(t);
  const rootY = lanes.length ? (lanes[0].y + lanes[lanes.length - 1].y) / 2 : PAD;
  for (const l of lanes) if (l.startY < 0) l.startY = rootY;
  const maxX = Math.max(rootX + STEP * 2, ...lanes.map(l => l.endX)) + STEP;
  return { lanes, rootX, rootY, closeX: maxX, width: maxX + PAD, height: Math.max(PAD * 2, PAD * 2 + (lanes.length - 1) * LANE) };
}

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
};

export default function LoopGraph({ loop, selectedThreadId, onSelectThread, onSelectAction, onAddStep }: {
  loop: Loop;
  selectedThreadId?: string;
  onSelectThread: (id: string) => void;
  onSelectAction: (threadId: string, actionId: string) => void;
  onAddStep: (threadId: string) => void;
}) {
  const g = useMemo(() => layout(loop), [loop]);
  const today = new Date().toISOString().slice(0, 10);
  const closed = loop.status === 'resolved';

  return (
    <div className="rounded-xl border border-border/30 bg-background/40 overflow-x-auto">
      <svg width={g.width} height={g.height} className="block">
        <defs>
          <filter id="loopglow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <style>{`
            .flow{stroke-dasharray:6 10;animation:loopflow 1.6s linear infinite}
            .breath{animation:loopbreath 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
            @keyframes loopflow{to{stroke-dashoffset:-32}}
            @keyframes loopbreath{50%{opacity:.35;transform:scale(1.35)}}
          `}</style>
        </defs>

        {/* closing arc when the whole loop is resolved */}
        {closed && (
          <path d={`M${g.closeX},${g.rootY} C${g.closeX + 30},${-20} ${g.rootX - 30},${-20} ${g.rootX},${g.rootY}`}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} filter="url(#loopglow)" opacity={0.8} />
        )}

        {g.lanes.map(l => {
          const done = l.t.status === 'resolved';
          const waiting = l.t.status === 'waiting';
          const sel = l.t.id === selectedThreadId;
          const color = done ? 'hsl(var(--primary))' : waiting ? 'hsl(38 92% 60%)' : 'hsl(var(--accent))';
          const firstX = l.startX + STEP;
          return (
            <g key={l.t.id} opacity={sel || !selectedThreadId ? 1 : 0.65}>
              {/* fork curve */}
              <path d={curve(l.startX, l.startY, firstX - STEP / 2, l.y) + ` L${l.endX},${l.y}`} fill="none"
                stroke={color} strokeWidth={sel ? 3 : 2} opacity={0.35} />
              {!done && <path d={curve(l.startX, l.startY, firstX - STEP / 2, l.y) + ` L${l.endX},${l.y}`} fill="none"
                stroke={color} strokeWidth={2} className={waiting ? undefined : 'flow'} />}
              {/* loop back into the close point */}
              {done && <path d={curve(l.endX - STEP / 2, l.y, g.closeX, g.rootY)} fill="none" stroke={color} strokeWidth={2} filter="url(#loopglow)" />}
              {/* thread label */}
              <text x={firstX - STEP / 2 + 4} y={l.y - 12} fontSize={11} fill="hsl(var(--muted-foreground))"
                className="cursor-pointer select-none" onClick={() => onSelectThread(l.t.id)}>{l.t.name}</text>

              {l.nodes.map(n => {
                const kind = n.a.kind ?? 'action';
                const overdue = kind === 'waiting' && !n.a.completed && l.t.waitingUntil && l.t.waitingUntil <= today;
                const fill = n.a.completed ? color : 'hsl(var(--background))';
                return (
                  <g key={n.a.id} className="cursor-pointer" onClick={() => onSelectAction(l.t.id, n.a.id)}>
                    <title>{`${n.a.text}${kind !== 'action' ? ` (${kind})` : ''}`}</title>
                    {overdue && <circle cx={n.x} cy={n.y} r={13} fill="hsl(38 92% 60%)" className="breath" />}
                    {kind === 'action' && <circle cx={n.x} cy={n.y} r={9} fill={fill} stroke={color} strokeWidth={2.5} />}
                    {kind === 'waiting' && (
                      <g>
                        <circle cx={n.x} cy={n.y} r={9} fill={fill} stroke="hsl(38 92% 60%)" strokeWidth={2} strokeDasharray="3 3" />
                        {!n.a.completed && <circle cx={n.x} cy={n.y} r={3} fill="hsl(38 92% 60%)" className="breath" />}
                      </g>
                    )}
                    {kind === 'milestone' && (
                      <rect x={n.x - 7} y={n.y - 7} width={14} height={14} transform={`rotate(45 ${n.x} ${n.y})`}
                        fill={n.a.completed ? color : 'hsl(var(--background))'} stroke={color} strokeWidth={2} />
                    )}
                    <text x={n.x} y={n.y + 24} fontSize={10} textAnchor="middle" fill="hsl(var(--foreground))" opacity={0.8}
                      className="select-none pointer-events-none">{n.a.text.length > 12 ? n.a.text.slice(0, 11) + '…' : n.a.text}</text>
                  </g>
                );
              })}

              {/* add step at the end of the track */}
              {!done && (
                <g className="cursor-pointer" onClick={() => onAddStep(l.t.id)}>
                  <title>Add a step to {l.t.name}</title>
                  <circle cx={l.endX} cy={l.y} r={9} fill="hsl(var(--background))" stroke={color} strokeDasharray="2 3" />
                  <text x={l.endX} y={l.y + 4} fontSize={13} textAnchor="middle" fill={color} className="select-none">+</text>
                </g>
              )}
            </g>
          );
        })}

        {/* root seal */}
        <g filter="url(#loopglow)">
          <circle cx={g.rootX} cy={g.rootY} r={15} fill="hsl(var(--primary) / 0.25)" stroke="hsl(var(--primary))" strokeWidth={2.5} />
          <circle cx={g.rootX} cy={g.rootY} r={6} fill="hsl(var(--primary))" className={closed ? undefined : 'breath'} />
        </g>
        {/* close point */}
        <circle cx={g.closeX} cy={g.rootY} r={closed ? 10 : 6} fill={closed ? 'hsl(var(--primary))' : 'none'}
          stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray={closed ? undefined : '3 3'} opacity={0.8}>
          <title>{closed ? 'Loop closed' : 'Close the loop when everything is resolved'}</title>
        </circle>
      </svg>
    </div>
  );
}
