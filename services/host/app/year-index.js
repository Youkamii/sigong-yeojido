// Sorted interval tree: long lifespans crossing the window must not be lost.
export function createYearIndex(rows){
  const sorted=rows.map((row,order)=>({row,order})).sort((a,b)=>a.row.lo-b.row.lo||a.order-b.order);
  const build=(lo,hi)=>{
    if(lo>=hi)return null;
    const mid=(lo+hi)>>1,left=build(lo,mid),right=build(mid+1,hi),entry=sorted[mid];
    return {...entry,left,right,max:Math.max(entry.row.hi,left?.max??-Infinity,right?.max??-Infinity)};
  };
  const root=build(0,sorted.length);
  return {between(from,to){
    const found=[];
    const visit=node=>{
      if(!node||node.max<from)return;
      visit(node.left);
      if(node.row.lo>to)return;
      if(node.row.hi>=from)found.push(node);
      visit(node.right);
    };
    visit(root);return found.sort((a,b)=>a.order-b.order).map(entry=>entry.row);
  }};
}
