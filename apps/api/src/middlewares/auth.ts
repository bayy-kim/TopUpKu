import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? ''
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' })
    return
  }

  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { adminId: string; email: string }
    ;(req as any).admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
