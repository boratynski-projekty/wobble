export type BlockKind = "foundation" | "optional";
export type TowerStatus = "open" | "standing" | "collapsed";

export type Block = {
  id: string;
  title: string;
  kind: BlockKind;
  position: number;
  done_at: string | null;
  seed: number;
};

export type Tower = {
  id: string;
  local_date: string;
  status: TowerStatus;
};
