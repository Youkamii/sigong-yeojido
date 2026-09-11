const paths={
  search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  close:'<path d="m5 5 14 14M19 5 5 19"/>',
  layers:'<path d="m12 2 10 6-10 6L2 8Zm-10 10 10 6 10-6M2 17l10 6 10-6"/>',
  left:'<path d="m15 4-8 8 8 8"/>',right:'<path d="m9 4 8 8-8 8"/>',
  arrow:'<path d="M3 12h18m-7-7 7 7-7 7"/>',
  list:'<path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01"/>',
  star:'<path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  person:'<circle cx="12" cy="6" r="4"/><path d="M3 22v-3a9 9 0 0 1 18 0v3Z"/>',
  event:'<path d="M5 2h10l4 4v16H5ZM14 2v5h5M8 11h8M8 15h8M8 19h6"/>',
  battle:'<path d="m3 3 3 1 14 14-2 2L4 6Zm18 0-3 1L4 18l2 2L20 6ZM2 16l6 6m8-20 6 6"/>',
  ship:'<path d="M2 17h20l-4 5H7Zm4 0V7h5v10m2 0V4h5v13M8 7V3m7 1V1"/>',
  castle:'<path d="M3 21V6h4v3h3V6h4v3h3V6h4v15ZM9 21v-6a3 3 0 0 1 6 0v6"/>',
  send:'<path d="m22 2-7 20-4-9L2 9Zm0 0L11 13"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',minus:'<path d="M4 12h16"/>',
};
export const icon=name=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.event}</svg>`;
