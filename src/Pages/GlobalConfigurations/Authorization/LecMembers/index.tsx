/** 位于成员权限表单顶部，用正式成员选择器替代手填邮箱。 */
import { ComponentSizeType, OptionType, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'

import { LecMember } from './service'

interface LecMemberPickerProps {
    members: LecMember[]
    value: OptionType[]
    onChange: (value: OptionType[]) => void
    error: string
    disabled: boolean
}

export const getMemberLabel = (member: LecMember) =>
    [
        member.name || member.username || '未命名成员',
        member.username && member.username !== member.name ? `@${member.username}` : '',
    ]
        .filter(Boolean)
        .join(' ')

export const LecMemberPicker = ({ members, value, onChange, error, disabled }: LecMemberPickerProps) => {
    const options = members.map((member) => ({ value: member.account, label: getMemberLabel(member) }))

    return (
        <SelectPicker
            inputId="lec-members"
            label="工作室成员"
            placeholder="搜索姓名或 Handle"
            required
            isMulti
            isSearchable
            isClearable
            options={options}
            value={value}
            onChange={onChange}
            error={error}
            isDisabled={disabled}
            size={ComponentSizeType.large}
        />
    )
}
