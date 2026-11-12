import { get, ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export interface LecRepository {
    id: number
    name: string
    fullName: string
    url: string
    defaultBranch: string
    private: boolean
}

export interface LecRepositoriesResponse {
    enabled: boolean
    organization: string
    repositories: LecRepository[]
}

export const getLecRepositories = (): Promise<ResponseType<LecRepositoriesResponse>> => get('git/lec/repositories')
