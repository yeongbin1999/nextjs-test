/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ProductRequestDto {
  /**
   * @minLength 0
   * @maxLength 100
   */
  name: string;
  imageUrl?: string;
  /**
   * @format int32
   * @min 0
   */
  price: number;
  /**
   * @format int32
   * @min 0
   */
  stock: number;
  /**
   * @minLength 0
   * @maxLength 500
   */
  description?: string;
  /** @format int32 */
  categoryId: number;
}

export interface CategoryResponseDto {
  /** @format int32 */
  id?: number;
  name?: string;
  /** @format int32 */
  parentId?: number;
  children?: any[];
}

export interface ProductResponseDto {
  /** @format int32 */
  id?: number;
  name?: string;
  imageUrl?: string;
  /** @format int32 */
  price?: number;
  /** @format int32 */
  stock?: number;
  description?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  category?: CategoryResponseDto;
}

export interface CategoryRequestDto {
  /**
   * @minLength 0
   * @maxLength 50
   */
  name: string;
  /** @format int32 */
  parentId?: number;
}

export interface SignupRequest {
  /** @minLength 1 */
  email: string;
  /**
   * @minLength 8
   * @maxLength 20
   */
  password: string;
  /** @minLength 1 */
  name: string;
}

export interface LoginRequest {
  /** @minLength 1 */
  email: string;
  /** @minLength 1 */
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
}

export interface UserResponse {
  /** @format int32 */
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string; // ← 추가!
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
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
      baseURL: axiosConfig.baseURL || 'http://localhost:8080',
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
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem)
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === 'object'
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== 'string'
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API 서버
 * @version beta
 * @baseUrl http://localhost:8080
 *
 * 팀5 1차 프로젝트 API 서버 문서입니다.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags product-controller
     * @name UpdateProduct
     * @request PUT:/api/v1/admin/products/{id}
     */
    updateProduct: (
      id: number,
      data: ProductRequestDto,
      params: RequestParams = {}
    ) =>
      this.request<ProductResponseDto, any>({
        path: `/api/v1/admin/products/${id}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name DeleteProduct
     * @request DELETE:/api/v1/admin/products/{id}
     */
    deleteProduct: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admin/products/${id}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags category-controller
     * @name UpdateCategory
     * @request PUT:/api/v1/admin/categories/{id}
     */
    updateCategory: (
      id: number,
      data: CategoryRequestDto,
      params: RequestParams = {}
    ) =>
      this.request<CategoryResponseDto, any>({
        path: `/api/v1/admin/categories/${id}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags category-controller
     * @name DeleteCategory
     * @request DELETE:/api/v1/admin/categories/{id}
     */
    deleteCategory: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admin/categories/${id}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Signup
     * @request POST:/api/v1/auth/signup
     */
    signup: (data: SignupRequest, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/api/v1/auth/signup`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Reissue
     * @request POST:/api/v1/auth/reissue
     */
    reissue: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/auth/reissue`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Logout
     * @request POST:/api/v1/auth/logout
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/auth/logout`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Login
     * @request POST:/api/v1/auth/login
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name ChangePassword
     * @request POST:/api/v1/auth/change-password
     */
    changePassword: (data: ChangePasswordRequest, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/api/v1/auth/change-password`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name CreateProduct
     * @request POST:/api/v1/admin/products
     */
    createProduct: (data: ProductRequestDto, params: RequestParams = {}) =>
      this.request<ProductResponseDto, any>({
        path: `/api/v1/admin/products`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags category-controller
     * @name CreateCategory
     * @request POST:/api/v1/admin/categories
     */
    createCategory: (data: CategoryRequestDto, params: RequestParams = {}) =>
      this.request<CategoryResponseDto, any>({
        path: `/api/v1/admin/categories`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name GetMe
     * @request GET:/api/v1/users/me
     */
    getMe: (params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/v1/users/me`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name UpdateMe
     * @request PATCH:/api/v1/users/me
     */
    updateMe: (data: UpdateUserRequest, params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/v1/users/me`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name GetAllProducts
     * @request GET:/api/v1/products
     */
    getAllProducts: (params: RequestParams = {}) =>
      this.request<ProductResponseDto[], any>({
        path: `/api/v1/products`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name GetProductById
     * @request GET:/api/v1/products/{id}
     */
    getProductById: (id: number, params: RequestParams = {}) =>
      this.request<ProductResponseDto, any>({
        path: `/api/v1/products/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags category-controller
     * @name GetAllCategories
     * @request GET:/api/v1/categories
     */
    getAllCategories: (params: RequestParams = {}) =>
      this.request<CategoryResponseDto[], any>({
        path: `/api/v1/categories`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags category-controller
     * @name GetCategoryById
     * @request GET:/api/v1/categories/{id}
     */
    getCategoryById: (id: number, params: RequestParams = {}) =>
      this.request<CategoryResponseDto, any>({
        path: `/api/v1/categories/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags category-controller
     * @name GetRootCategories
     * @request GET:/api/v1/categories/roots
     */
    getRootCategories: (params: RequestParams = {}) =>
      this.request<CategoryResponseDto[], any>({
        path: `/api/v1/categories/roots`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
