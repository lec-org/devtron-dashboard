import { get, ResponseType } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

export interface LecMember {
    subject: string
    account: string
    name: string
    username: string
}

export interface LecMembersResponse {
    enabled: boolean
    members: LecMember[]
}

/** 成员只用于展示和选择，真正授权仍由后端校验稳定身份键。 */
export const getLecMembers = (): Promise<ResponseType<LecMembersResponse>> => get(`${Routes.USER}/lec/members`)
