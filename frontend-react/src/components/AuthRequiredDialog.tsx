import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, UserPlus, X } from 'lucide-react'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {title || t('authRequired.title', 'Требуется авторизация')}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {description || t('authRequired.description', 'Для выполнения этого действия необходимо войти в аккаунт')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="w-full sm:w-auto"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {t('authRequired.signIn', 'Войти')}
          </Button>
          <Button
            onClick={handleSignUp}
            className="w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t('authRequired.signUp', 'Зарегистрироваться')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
