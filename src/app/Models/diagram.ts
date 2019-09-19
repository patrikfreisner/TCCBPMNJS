import {Notation} from './notation';

export class Diagram {
  id?: number;
  name: string;
  bpm_diagram_code: string;
  constraintLimit: number;
  updated_at: string;
  created_at: string;
  notation: Notation[];
}
