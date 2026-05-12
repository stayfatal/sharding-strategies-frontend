/**
 * Swagger-codegen-style клиент (axios) для доменов «заявка» (system_loads)
 * и связи «заявка–стратегия» (system_load_strategies).
 * Услуги (strategies) и users — не включены: для них используется отдельный axios в модулях.
 */

export interface WebBackendInternalAppSerializerShardingStrategyJSON {
  description?: string;
  is_deleted?: boolean;
  latency_coefficient?: number;
  photo_url?: string;
  reliability_coefficient?: number;
  strategy_id?: number;
  throughput_coefficient?: number;
  title?: string;
  video?: string;
  short_description_en?: string;
}

export interface WebBackendInternalAppSerializerSystemLoadJSON {
  system_load_id?: number;
  status?: string;
  created_at?: string;
  creator_login?: string;
  moderator_login?: string | null;
  forming_date?: string | null;
  finish_date?: string | null;
  description?: string | null;
  completed_item_count?: number;
}

export interface WebBackendInternalAppSerializerSystemLoadStrategyJSON {
  data_volume?: number;
  query_count?: number;
  response_time?: number | null;
  strategy_id?: number;
  system_load_id?: number;
}

export interface WebBackendInternalAppSerializerSystemLoadStrategyDetailJSON {
  system_load_id?: number;
  strategy_id?: number;
  data_volume?: number;
  query_count?: number;
  response_time?: number | null;
  strategy: WebBackendInternalAppSerializerShardingStrategyJSON;
}

export interface WebBackendInternalAppSerializerStatusJSON {
  status?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, unknown>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  secure?: boolean;
  path: string;
  type?: ContentType;
  query?: QueryParamsType;
  format?: ResponseType;
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export const ContentType = {
  Json: "application/json",
  JsonApi: "application/vnd.api+json",
  FormData: "multipart/form-data",
  UrlEncoded: "application/x-www-form-urlencoded",
  Text: "text/plain",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "//localhost:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    }
    return `${formItem}`;
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: unknown[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = unknown, _E = unknown>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    let reqBody: unknown = body;
    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      reqBody = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      reqBody = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: reqBody,
      url: path,
    });
  };
}

export class Api<SecurityDataType extends unknown = unknown> extends HttpClient<SecurityDataType> {
  /** Связь стратегии с заявкой (многие-ко-многим через таблицу нагрузки) */
  systemLoadStrategyBinding = {
    addStrategyToSystemLoadDraft: (strategyId: number, params: RequestParams = {}) =>
      this.request<WebBackendInternalAppSerializerSystemLoadJSON, Record<string, string>>({
        path: `/system_load_strategies/add/${strategyId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    updateSystemLoadStrategyLine: (
      strategyId: number,
      systemLoadId: number,
      data: WebBackendInternalAppSerializerSystemLoadStrategyJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerSystemLoadStrategyJSON,
        Record<string, string>
      >({
        path: `/system_load_strategies/${strategyId}/${systemLoadId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    deleteSystemLoadStrategyLine: (
      strategyId: number,
      systemLoadId: number,
      params: RequestParams = {},
    ) =>
      this.request<WebBackendInternalAppSerializerSystemLoadJSON, Record<string, string>>({
        path: `/system_load_strategies/${strategyId}/${systemLoadId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };

  /** Заявка на системную нагрузку (system_loads) */
  systemLoadApplication = {
    systemLoadApplicationCartList: (params: RequestParams = {}) =>
      this.request<Record<string, unknown>, Record<string, string>>({
        path: `/system_loads/cart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    allSystemLoadApplicationsList: (
      query?: {
        "from-date"?: string;
        "to-date"?: string;
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<WebBackendInternalAppSerializerSystemLoadJSON[], Record<string, string>>({
        path: `/system_loads`,
        method: "GET",
        query,
        secure: true,
        format: "json",
        ...params,
      }),

    systemLoadApplicationDetail: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, unknown>, Record<string, string>>({
        path: `/system_loads/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    editSystemLoadApplicationUpdate: (
      id: number,
      body: WebBackendInternalAppSerializerSystemLoadJSON,
      params: RequestParams = {},
    ) =>
      this.request<WebBackendInternalAppSerializerSystemLoadJSON, Record<string, string>>({
        path: `/system_loads/${id}`,
        method: "PUT",
        body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    deleteSystemLoadApplicationDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/system_loads/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    formSystemLoadApplicationUpdate: (id: number, params: RequestParams = {}) =>
      this.request<WebBackendInternalAppSerializerSystemLoadJSON, Record<string, string>>({
        path: `/system_loads/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    finishSystemLoadApplicationUpdate: (
      id: number,
      status: WebBackendInternalAppSerializerStatusJSON,
      params: RequestParams = {},
    ) =>
      this.request<WebBackendInternalAppSerializerSystemLoadJSON, Record<string, string>>({
        path: `/system_loads/${id}/finish`,
        method: "PUT",
        body: status,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
