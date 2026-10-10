import { Component, Suspense, type ReactNode } from 'react'

/**
 * 모델 하나가 로드에 실패해도(파일 없음·손상) 그 오브젝트만 빠지고 공간 전체는 계속 돌게 한다.
 * 실패는 콘솔에 한 번 남긴다.
 */
class Boundary extends Component<{ label: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn(`[model] ${this.props.label} 로드 실패 — 이 오브젝트만 생략`, err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function ModelBoundary({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Boundary label={label}>
      <Suspense fallback={null}>{children}</Suspense>
    </Boundary>
  )
}
