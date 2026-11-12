/** 位于单点登录配置页，说明 LecSSO 的托管方式和成员授权入口。 */
import { Link } from 'react-router-dom'

import { InfoBlock, ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'

export const LecSSOStatus = () => (
    <section className="p-20 flex column left dc__gap-16">
        <h2 className="fs-16 fw-6 m-0">已接入 LecSSO</h2>
        <InfoBlock
            variant="help"
            description="工作室成员使用现有账号登录。认证配置由服务端统一维护，成员停用或退出工作室后将失去访问权限。"
        />
        <p className="m-0">登录不会自动获得发布权限。管理员可以按应用和环境分配查看、构建与发布权限。</p>
        <Link className="anchor" to={ROUTER_URLS.GLOBAL_CONFIG_AUTH.USERS}>
            管理成员权限
        </Link>
    </section>
)
