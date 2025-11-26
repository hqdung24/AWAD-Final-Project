// src/pages/errors/403.tsx
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold">403</CardTitle>
          <CardDescription className="mt-2">
            Bạn không có quyền truy cập vào trang này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Có thể bạn cần đăng nhập với quyền phù hợp hoặc liên hệ quản trị
            viên để được cấp quyền.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button onClick={() => navigate('/')}>Về trang chủ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
