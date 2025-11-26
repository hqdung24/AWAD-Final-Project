import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold">404</CardTitle>
          <CardDescription className="mt-2">
            Trang bạn tìm không tồn tại.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Có thể URL đã bị gõ sai hoặc trang đã bị xóa. Hãy kiểm tra lại hoặc
            quay về trang chủ.
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
