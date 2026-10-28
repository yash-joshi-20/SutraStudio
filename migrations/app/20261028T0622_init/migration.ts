#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/badeccb6e74266f030aad9f13bd4f263b6817e4dc5897efccebc1a83b8bff4ed/contract';
import endContract from '../../snapshots/badeccb6e74266f030aad9f13bd4f263b6817e4dc5897efccebc1a83b8bff4ed/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Inquiry',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('service', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('new'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'KeyValue',
        columns: [
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['key'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Notification',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('link', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('read', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('system'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userUid', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Order',
        columns: [
          col('amountPaid', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('brief', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('clientEmail', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('clientName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('clientUid', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('orderNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('packageId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('packageName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('paymentStatus', 'text', {
            notNull: true,
            default: lit('pending_payment'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('service', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('source', 'text', {
            notNull: true,
            default: lit('web'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending_verification'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalAmount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('turnaround', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Payment',
        columns: [
          col('amount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('clientEmail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('clientUid', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('method', 'text', {
            notNull: true,
            default: lit('upi_qr'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('orderId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('receiptUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending_verification'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('utr', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('adminNotes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('billingData', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('company', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('driveFolderId', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('driveFolderLink', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('emailVerified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('photoURL', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('client'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('Active'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tier', 'text', {
            notNull: true,
            default: lit('Standard'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('uid', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Order',
        constraint: 'Order_orderNumber_key',
        columns: ['orderNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_uid_key',
        columns: ['uid'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_userUid_idx_0985121c',
        columns: ['userUid'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_clientUid_idx_22b62c23',
        columns: ['clientUid'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_clientUid_idx_22b62c23',
        columns: ['clientUid'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_orderId_idx_d284871b',
        columns: ['orderId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Notification',
        foreignKey: {
          name: 'Notification_userUid_fkey',
          columns: ['userUid'],
          references: { schema: 'public', table: 'User', columns: ['uid'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_clientUid_fkey',
          columns: ['clientUid'],
          references: { schema: 'public', table: 'User', columns: ['uid'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Payment',
        foreignKey: {
          name: 'Payment_clientUid_fkey',
          columns: ['clientUid'],
          references: { schema: 'public', table: 'User', columns: ['uid'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Payment',
        foreignKey: {
          name: 'Payment_orderId_fkey',
          columns: ['orderId'],
          references: { schema: 'public', table: 'Order', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
