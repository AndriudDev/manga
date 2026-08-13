import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../theme/colors';
import { TaskController } from '../controllers/TaskController';
import { TodoTask, TaskLocation } from '../models/Task';
import { persistPhoto, deletePhoto } from '../models/PhotoStore';
import { LocationTracker } from '../models/LocationTracker';

interface HomeScreenProps {
  userName?: string;
  onLogout: () => void;
}

export default function HomeScreen({ userName, onLogout }: HomeScreenProps) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<string | undefined>(undefined);
  const [previewLocation, setPreviewLocation] = useState<TaskLocation | undefined>(undefined);
  const [viewingTask, setViewingTask] = useState<TodoTask | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);

  const refresh = useCallback(async () => {
    setTasks(await TaskController.getTasks());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const openCamera = async (): Promise<ImagePicker.ImagePickerAsset | undefined> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a la cámara para adjuntar fotos a tus tareas.',
      );
      return undefined;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });
    if (result.canceled) return undefined;
    return result.assets[0];
  };

  const handleCaptureForNew = async () => {
    const asset = await openCamera();
    if (!asset) return;
    setPreviewPhoto(await persistPhoto(asset.uri));
  };

  const handleCaptureLocation = async () => {
    const result = await LocationTracker.capture();
    if (!result.ok) {
      if (result.reason === 'denied') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu ubicación para registrar las coordenadas de la tarea.',
        );
      } else {
        Alert.alert(
          'Ubicación no disponible',
          'No se pudo obtener la ubicación actual. Inténtalo de nuevo.',
        );
      }
      return;
    }
    setPreviewLocation(result.location);
  };

  const handleRemoveLocation = () => {
    setPreviewLocation(undefined);
  };

  const handleRemovePreview = async () => {
    if (previewPhoto) {
      await deletePhoto(previewPhoto);
      setPreviewPhoto(undefined);
    }
  };

  const handleAdd = async () => {
    if (input.trim().length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Las coordenadas son obligatorias: usa la captura previa o las obtiene ahora.
      let location = previewLocation;
      if (!location) {
        const result = await LocationTracker.capture();
        if (!result.ok) {
          if (result.reason === 'denied') {
            Alert.alert(
              'Permiso requerido',
              'Necesitamos acceso a tu ubicación para crear la tarea.',
            );
          } else {
            Alert.alert(
              'Ubicación no disponible',
              'No se pudo obtener la ubicación actual. Inténtalo de nuevo.',
            );
          }
          return;
        }
        location = result.location;
      }

      const updated = await TaskController.addTask(input, previewPhoto, location);
      setTasks(updated);
      setInput('');
      // La foto pasa a ser propiedad de la tarea; no se elimina el archivo.
      setPreviewPhoto(undefined);
      setPreviewLocation(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    setTasks(await TaskController.toggleTask(id));
  };

  const handleAttachPhoto = async (id: string) => {
    const asset = await openCamera();
    if (!asset) return;
    setTasks(await TaskController.attachPhoto(id, asset.uri));
  };

  const handleClearPhoto = async (id: string) => {
    setTasks(await TaskController.clearPhoto(id));
    setViewingTask(undefined);
  };

  const handleDelete = async (id: string) => {
    setTasks(await TaskController.deleteTask(id));
  };

  /** Sincroniza la lista local con el servicio web (almacenamiento remoto). */
  const handleSync = async () => {
    if (syncing || importing) return;
    setSyncing(true);
    try {
      const result = await TaskController.syncToRemote();
      setTasks(await TaskController.getTasks());
      if (result.created === 0 && result.updated === 0) {
        Alert.alert('Sincronización', 'No hay tareas nuevas para subir al servicio web.');
      } else {
        Alert.alert(
          'Sincronización completa',
          `${result.created} tarea(s) creada(s) y ${result.updated} actualizada(s) en el servicio web.`,
        );
      }
    } catch {
      Alert.alert(
        'Error de sincronización',
        'No se pudo conectar con el servicio web. Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setSyncing(false);
    }
  };

  /** Importa tareas desde la API externa para completar la lista. */
  const handleImport = async () => {
    if (syncing || importing) return;
    setImporting(true);
    try {
      const count = await TaskController.importFromApi();
      setTasks(await TaskController.getTasks());
      if (count === 0) {
        Alert.alert('Importación', 'No se encontraron tareas nuevas para importar.');
      } else {
        Alert.alert('Importación completa', `Se importaron ${count} tarea(s) desde la API externa.`);
      }
    } catch {
      Alert.alert(
        'Error de importación',
        'No se pudo obtener la lista desde la API externa. Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setImporting(false);
    }
  };

  const pendingCount = tasks.filter((task) => !task.completed).length;

  const renderItem = ({ item }: { item: TodoTask }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskRow}>
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxDone]}
          activeOpacity={0.7}
          onPress={() => handleToggle(item.id)}
        >
          {item.completed ? (
            <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
          ) : null}
        </TouchableOpacity>
        <Text
          style={[styles.taskTitle, item.completed && styles.taskTitleDone]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => handleAttachPhoto(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          <Ionicons name="camera-outline" size={20} color={Colors.accentTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
      {item.location ? (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.accentSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location.latitude.toFixed(5)}, {item.location.longitude.toFixed(5)}
          </Text>
        </View>
      ) : null}
      {item.photoUri ? (
        <TouchableOpacity
          style={styles.thumbContainer}
          activeOpacity={0.8}
          onPress={() => setViewingTask(item)}
        >
          <Image source={{ uri: item.photoUri }} style={styles.taskThumb} resizeMode="cover" />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundPrimary} />

      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>¡Hola, {userName ?? 'Lector'}!</Text>
          <Text style={styles.subtitle}>
            Tienes {pendingCount} tarea{pendingCount === 1 ? '' : 's'} pendiente
            {pendingCount === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={onLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Acciones con el servicio web (sincronización e importación) */}
      <View style={styles.cloudRow}>
        <TouchableOpacity
          style={styles.cloudButton}
          activeOpacity={0.8}
          onPress={handleSync}
          disabled={syncing || importing}
        >
          {syncing ? (
            <ActivityIndicator color={Colors.accentPrimary} size="small" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={18} color={Colors.accentPrimary} />
          )}
          <Text style={styles.cloudButtonText}>Sincronizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cloudButton}
          activeOpacity={0.8}
          onPress={handleImport}
          disabled={syncing || importing}
        >
          {importing ? (
            <ActivityIndicator color={Colors.accentSecondary} size="small" />
          ) : (
            <Ionicons name="cloud-download-outline" size={18} color={Colors.accentSecondary} />
          )}
          <Text style={styles.cloudButtonText}>Importar de API</Text>
        </TouchableOpacity>
      </View>

      {/* Entrada nueva tarea */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Agregar nueva tarea..."
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity
          style={styles.squareButton}
          activeOpacity={0.7}
          onPress={handleCaptureForNew}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="camera" size={22} color={Colors.accentTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.squareButton}
          activeOpacity={0.7}
          onPress={handleCaptureLocation}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="location" size={22} color={Colors.accentSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addButton,
            (input.trim().length === 0 || isSubmitting) && styles.addButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleAdd}
          disabled={input.trim().length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <Ionicons name="add" size={26} color={Colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Vista previa de la foto para la nueva tarea */}
      {previewPhoto ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: previewPhoto }} style={styles.previewThumb} resizeMode="cover" />
          <Text style={styles.previewText}>Adjunta a la nueva tarea</Text>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleRemovePreview}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Vista previa de la ubicación para la nueva tarea */}
      {previewLocation ? (
        <View style={styles.previewRow}>
          <Ionicons name="location" size={20} color={Colors.accentSecondary} />
          <Text style={styles.previewText} numberOfLines={1}>
            {previewLocation.latitude.toFixed(5)}, {previewLocation.longitude.toFixed(5)}
          </Text>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleRemoveLocation}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Lista de tareas */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accentPrimary} size="large" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Sin tareas por ahora</Text>
              <Text style={styles.emptySubtitle}>
                Agrega tu primera tarea usando el campo de arriba.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de foto ampliada */}
      <Modal
        visible={viewingTask !== undefined}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingTask(undefined)}
      >
        <View style={styles.modalOverlay}>
          <Image
            source={{ uri: viewingTask?.photoUri }}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={() => viewingTask && handleClearPhoto(viewingTask.id)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={[styles.modalButtonText, { color: Colors.error }]}>
                Quitar foto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={() => setViewingTask(undefined)}
            >
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: 60,
  },

  // Encabezado
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfacePrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Servicio web (sincronización / importación)
  cloudRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  cloudButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
  },
  cloudButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Entrada
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    height: '100%',
  },
  squareButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },

  // Vista previa
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 8,
  },
  previewThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Lista
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  taskCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.accentSecondary,
    borderColor: Colors.accentSecondary,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  taskTitleDone: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  iconButton: {
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  thumbContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  taskThumb: {
    width: '100%',
    height: 160,
  },
  separator: {
    height: 10,
  },

  // Estados
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfacePrimary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
