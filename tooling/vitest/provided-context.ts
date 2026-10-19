declare module "vitest" {
  export interface ProvidedContext {
    postgresMaintenanceDatabaseUrl: string;
    postgresTemplateDatabaseName: string;
  }
}
