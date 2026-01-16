import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, UserPlus, X, Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface AuthRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function AuthRequiredDialog({ 
  open, 
  onOpenChange,
  title,
  description 
}: AuthRequiredDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignIn = () => {
    const currentPath = location.pathname + location.search
    const redirectUrl = currentPath !== '/auth' && currentPath !== '/auth?' 
      ? `/auth?redirect=${encodeURIComponent(currentPath)}`
      : '/auth'
    navigate(redirectUrl)
    onOpenChange(false)
  }

  const handleSignUp = () => {
    const currentPath = location.pathname + location.search
    const redirectUrl = currentPath !== '/auth' && currentPath !== '/auth?' 
      ? `/auth?redirect=${encodeURIComponent(currentPath)}`
      : '/auth'
    navigate(redirectUrl)
    onOpenChange(false)
  }

  // Получаем переводы с проверкой
  const dialogTitle = title || (t('authRequired.title') || 'Требуется авторизация')
  const dialogDescription = description || (t('authRequired.description') || 'Для выполнения этого действия необходимо войти в аккаунт')
  const cancelText = t('common.cancel') || 'Отмена'
  const signInText = t('authRequired.signIn') || 'Войти'
  const signUpText = t('authRequired.signUp') || 'Зарегистрироваться'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-semibold">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base mt-2">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <X className="mr-2 h-4 w-4" />
            {cancelText}
          </Button>
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {signInText}
          </Button>
          <Button
            onClick={handleSignUp}
            className="w-full sm:w-auto order-2 sm:order-3"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {signUpText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
