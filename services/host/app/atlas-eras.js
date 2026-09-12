export const eras=[[-2500,'고대'],[-57,'삼국'],[698,'남북국'],[918,'고려'],[1392,'조선'],[1897,'대한제국'],[1910,'일제강점기'],[1945,'현대']];
export const eraAt=year=>eras.filter(([start])=>start<=year).at(-1)||eras[0];
