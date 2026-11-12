/** 位于应用的代码源配置表单，从组织 GitHub App 的授权仓库中选择项目。 */
import { ReactNode } from 'react'

import { ComponentSizeType, SelectPicker, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { getLecRepositories } from './service'

interface LecRepositoryPickerProps {
    value: string
    onChange: (url: string) => void
    error: string
    children: ReactNode
}

export const LecRepositoryPicker = ({ value, onChange, error, children }: LecRepositoryPickerProps) => {
    const [loading, response, requestError] = useAsync(getLecRepositories, [])
    const directory = response?.result

    if (!directory?.enabled) {
        return children
    }

    const options = directory.repositories.map((repository) => ({ label: repository.fullName, value: repository.url }))
    const selected = options.find((option) => option.value === value)

    return (
        <SelectPicker<string, false>
            inputId="lec-github-repository"
            label={`${directory.organization} 代码仓库`}
            placeholder="搜索已授权的仓库"
            options={options}
            value={selected ?? null}
            onChange={(option) => onChange(option?.value ?? '')}
            error={requestError ? '暂时无法同步 GitHub 仓库，请稍后重试。' : error}
            isLoading={loading}
            isSearchable
            required
            size={ComponentSizeType.large}
        />
    )
}
