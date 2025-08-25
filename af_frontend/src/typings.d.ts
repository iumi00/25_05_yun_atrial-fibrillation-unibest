// 全局要用的类型放到这里

declare global {
  type IResData<T> = {
    code: number
    msg: string
    data: T
  }

  // uni.uploadFile文件上传参数
  type IUniUploadFileOptions = {
    file?: File
    files?: UniApp.UploadFileOptionFiles[]
    filePath?: string
    name?: string
    formData?: any
  }

  type IUserInfo = {
    nickname?: string
    avatar?: string
    /** 微信的 openid，非微信没有这个字段 */
    openid?: string
    token?: string
  }
}
//问卷相关
declare module '@/types/api' {
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    error?: any;
  }

  export interface QuestionItem {
    id: number;
    itemTitle: string;
    itemScore: number;
    type: 'radio' | 'checkbox' | 'text' | 'number' | 'datetime';
    options?: Array<{
      value: number;
      label: string;
      score?: number;
    }>;
  }
}

export {} // 防止模块污染
