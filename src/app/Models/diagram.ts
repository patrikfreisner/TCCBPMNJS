import {Notation} from './notation';

export class Diagram {
  id?: number;
  bpmDiagramCode: string;
  constraintLimit: number;
  notation: Notation[];
}
