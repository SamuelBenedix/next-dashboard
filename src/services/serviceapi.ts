/* eslint-disable */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { MenuItem } from '../types/menu'

const API_URL_DEV = 'http://192.168.169.23/'

const defaultOptions: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
  },
}

export interface JwtPayload {
  // contoh properti token JWT, sesuaikan dengan payloadmu
  sub?: string
  name?: string
  iat?: number
  exp?: number
  [key: string]: any
}

export class Services {
  async getToken(): Promise<JwtPayload | null> {
    const jwT_Token = localStorage.getItem('jwT_Token')
    if (!jwT_Token) return null
    return this.parseJwt(jwT_Token.replace(/"/g, ''))
  }

  parseJwt(jwT_Token: string): JwtPayload {
    const base64Url = jwT_Token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  }

  async getIPAddress(param?: any): Promise<any> {
    const url = `https://api.ipify.org?format=json`
    try {
      const response = await axios.get(url, param)
      return response.data
    } catch (err) {
      return err
    }
  }

  async loadDraft(param: any) {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/LoadDraft?documentId=${param}`
    const options = {
      headers: {
        ...defaultOptions.headers,
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
      },
    }
    try {
      const response = await axios.get(url, options)
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async getNamedanEmail(param: any) {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/GetNameEmailLdap/${param}`
    try {
      const response = await axios.get(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async postLogin(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/Login`
    try {
      const response = await axios.post(url, param)
      return response.data
    } catch (err) {
      return err
    }
  }

  async getRefreshToken(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/RefreshToken`
    const options = {
      headers: {
        ...defaultOptions.headers,
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response.data
    } catch (err) {
      return err
    }
  }
  async getListPegawai(token?: string) {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/ListPegawai`

    // Utamakan token dari parameter
    const finalToken = token?.trim() ? token?.trim() : localStorage.getItem('jwT_Token')

    console.log('finalToken', finalToken)

    const options = {
      headers: {
        ...defaultOptions.headers,
        Authorization: 'Bearer ' + finalToken,
      },
    }

    try {
      const response = await axios.get(url, options)
      return response.data
    } catch (error) {
      console.error('Error getting list pegawai:', error)
      throw error
    }
  }

  async getMenu(): Promise<MenuItem[]> {
    const url = `${API_URL_DEV}SignPlus_Utility/api/Utility/GetMenu`
    const options = {
      headers: {
        ...defaultOptions.headers,
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
      },
    }
    try {
      const response = await axios.get(url, options)
      return response.data.data.data
    } catch (err) {
      return []
    }
  }

  async register(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/Register`
    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async uploadFile(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureNonCertified/api/NonCertified/upload`
    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async downloadFile(param: any): Promise<Blob> {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureNonCertified/api/NonCertified/download`


    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob' as const,
    }
    try {
      const response = await axios.post(url, param, options)
      return response.data
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  async uploadKTP(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/Update`
    const options = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
        'Content-Type': 'multipart/form-data',
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async getListDoc(param?: string): Promise<any> {
    let url = ''
    if (param) {
      url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/GetUserInbox?status=${param}`
    } else {
      url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/GetUserInbox`
    }
    const options = {
      headers: {
        ...defaultOptions.headers,
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
      },
    }
    try {
      const response = await axios.get(url, options)
      return response.data
    } catch (error) {
      console.error('Error fetching list doc:', error)
      throw error
    }
  }

  async downloadCertified(param: any, token?: string): Promise<AxiosResponse<ArrayBuffer>> {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/DownloadFile`;

    const finalToken = token?.trim() ? token?.trim() : localStorage.getItem('jwT_Token')

    console.log('finalToken', finalToken)


    const options: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + finalToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'arraybuffer', // ✅ Needed for react-pdf
    };

    try {
      const response = await axios.post(url, param, options);
      return response; // response.data will be ArrayBuffer
    } catch (error) {
      console.error('Error downloading certified file:', error);
      throw error;
    }
  }

  async signCertified(param: any, token?: string): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/DigitalSign`
    // Utamakan token dari parameter
    const finalToken = token?.trim() ? token?.trim() : localStorage.getItem('jwT_Token')

    console.log('finalToken', finalToken)

    const options = {
      headers: {
        Authorization: 'Bearer ' + finalToken,
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response
    } catch (error) {
      console.error('Error signing certified file:', error)
      throw error
    }
  }

  async viewProfile(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_UserManagement/api/Account/View`
    const options = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response
    } catch (error) {
      console.error('Error viewing profile:', error)
      throw error
    }
  }

  async logMonitoring(param: any): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/InsertPage`
    try {
      const response = await axios.post(url, param, defaultOptions)
      return response
    } catch (error) {
      console.error('Error logging monitoring:', error)
      throw error
    }
  }

  async loginMonitoring(param: string): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/Login?typeMonitoring=${param}`
    try {
      const response = await axios.post(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error login monitoring:', error)
      throw error
    }
  }

  async getDetailTTD(param: string): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/GetCertificateData?uniq=${param}`
    const options = {
      headers: {
        ...defaultOptions.headers,
        Authorization: 'Bearer ' + localStorage.getItem('jwT_Token'),
      },
    }
    try {
      const response = await axios.get(url, options)
      return response.data
    } catch (error) {
      console.error('Error getting detail TTD:', error)
      throw error
    }
  }

  async getListPageVisit(param: { page: number; pageSize: number }): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/PageVisit?Page=${param.page}&PageSize=${param.pageSize}`
    try {
      const response = await axios.get(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error getting list page visit:', error)
      throw error
    }
  }

  async getDocumentUploadDownload(param: string): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/Document?typeMonitoring=${param}`
    try {
      const response = await axios.get(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error getting document upload/download:', error)
      throw error
    }
  }

  async getBrowserData(): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/Browser`
    try {
      const response = await axios.get(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error getting browser data:', error)
      throw error
    }
  }

  async getOperatingSystemData(): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/OperatingSystem`
    try {
      const response = await axios.get(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error getting OS data:', error)
      throw error
    }
  }

  async getOSData(param: any) {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/OS?typeMonitoring=${param}`
    try {
      const response = await axios.post(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async getUserData(): Promise<any> {
    const url = `${API_URL_DEV}SignPlus_Monitoring/api/MonitoringSystem/User`
    try {
      const response = await axios.get(url, defaultOptions)
      return response
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  }
  async verifyFile(param: any) {
    const url = `${API_URL_DEV}SignPlus_DigitalSignatureCertified/api/Signature/VerifySignature`
    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    try {
      const response = await axios.post(url, param, options)
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }
}

const services = new Services()
export default services
