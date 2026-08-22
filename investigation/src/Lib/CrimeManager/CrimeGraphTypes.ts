import { FactRelation, FactType, MotiveType } from "./CrimeTypes";

export interface CrimeNodeData {
  kind: "crime";
  crimeId: string;
  title: string;
}

export interface PersonNodeData {
  kind: "person";
  personId: string;
  name: string;
}

export interface FactNodeData {
  kind: "fact";
  factId: string;
  factType: FactType;
  relation: FactRelation;
  description: string;
}

export interface LocationNodeData {
  kind: "location";
  name: string;
}

export interface TimeNodeData {
  kind: "time";
  value: string;
}

export interface MotiveNodeData {
  kind: "motive";
  motive: MotiveType;
}

export interface MethodNodeData {
  kind: "method";
  method: string;
}

export type CrimeGraphNodeData =
  | CrimeNodeData
  | PersonNodeData
  | FactNodeData
  | LocationNodeData
  | TimeNodeData
  | MotiveNodeData
  | MethodNodeData;
