import RemoteLoader from '@kne/remote-loader';
import { Alert, Badge, Button, Card, Descriptions, Divider, Flex, Image, Progress, Space, Steps, Table, Tag, Tooltip, Typography } from 'antd';

/** Markdown 中 md-components 默认可用的组件，type 即键名 */
const defaultComponents = {
  RemoteLoader,
  Alert,
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Image,
  Progress,
  Space,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
  Text: Typography.Text,
  Title: Typography.Title,
  Paragraph: Typography.Paragraph,
  Link: Typography.Link
};

export default defaultComponents;
