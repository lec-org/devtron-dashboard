/** 登录页左侧的中文产品介绍，替代上游带英文截图和客户引言的宣传面板。 */
export const LoginIntroduction = () => (
    <section className="login-introduction flexbox-col dc__gap-32 p-36 br-12 h-100 w-100 dc__content-center">
        <div className="flexbox-col dc__gap-12">
            <span className="fs-16 fw-6 cb-5">Devtron 发布平台</span>
            <h1 className="fs-32 fw-6 m-0">
                从代码到上线，
                <br />
                在一处完成。
            </h1>
            <p className="fs-16 lh-1-5 cn-8 m-0">统一管理应用的检查、构建、部署和回退，让团队专注于产品开发。</p>
        </div>
        <ul className="flexbox-col dc__gap-24 p-0 m-0 dc__no-list-style">
            <li>
                <h2 className="fs-16 fw-6">检查与构建</h2>
                <p className="fs-14 cn-8">连接代码仓库，用流水线完成检查和镜像构建。</p>
            </li>
            <li>
                <h2 className="fs-16 fw-6">发布与回退</h2>
                <p className="fs-14 cn-8">查看发布进度、运行状态和历史版本。</p>
            </li>
            <li>
                <h2 className="fs-16 fw-6">环境与配置</h2>
                <p className="fs-14 cn-8">集中管理 Kubernetes 应用、环境与访问权限。</p>
            </li>
        </ul>
    </section>
)
