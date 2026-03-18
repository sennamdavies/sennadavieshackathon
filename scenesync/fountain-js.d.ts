declare module "fountain-js" {
  export type FountainToken = {
    type?: string;
    text?: string;
    scene_number?: string;
  };

  export type FountainParseResult = {
    title?: string;
    html?: {
      title_page?: string;
      script?: string;
    };
    tokens?: FountainToken[];
  };

  export class Fountain {
    parse(script: string, includeTokens?: boolean): FountainParseResult;
  }
}
