import { AnalysisResult } from "./analysis.types";
import { UserMessage } from "./base.types";

export interface MessageInputProps {
    onSubmit: (message: UserMessage) => Promise<void>;
    isLoading?: boolean;
  }
  
  export interface AnalysisResultProps {
    result: AnalysisResult;
    onSave?: () => Promise<void>;
  }