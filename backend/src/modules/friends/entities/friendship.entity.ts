// friendship.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  BeforeInsert,
  Check,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('friendships')
@Index(['userAId', 'userBId'], { unique: true })
@Index('IDX_friendship_userA', ['userAId'])
@Index('IDX_friendship_userB', ['userBId'])
@Check('userA_different_userB', '"userAId" <> "userBId"') // ensure userA and userB are different
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // store ids and relations (optional - keep both for queries)
  @Column('uuid')
  userAId: string;

  @Column('uuid')
  userBId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  userA: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  userB: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // ensure canonical order before insert
  @BeforeInsert()
  ensureOrder() {
    if (this.userAId && this.userBId && this.userAId > this.userBId) {
      const tmpId = this.userAId;
      this.userAId = this.userBId;
      this.userBId = tmpId;
      // swap userA/userB refs if present
      const tmp = this.userA;
      this.userA = this.userB;
      this.userB = tmp;
    }
  }
}
